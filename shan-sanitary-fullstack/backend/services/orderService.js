import mongoose from "mongoose";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import AppError from "../utils/AppError.js";
import * as cartService from "./cartService.js";
import * as inventoryService from "./inventoryService.js";
import * as couponService from "./couponService.js";
import { calculateShippingFee } from "./pricingService.js";
import { logAction } from "./auditService.js";

const VALID_PAYMENT_METHODS = ["Cash on Delivery", "Bank Transfer", "Online Payment"];

export const createOrder = async (userId, { addressId, paymentMethod, couponCode }) => {
  if (!addressId) throw new AppError("Shipping address is required", 400);
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError("Shipping address not found", 404);

  // Re-fetch the cart FRESH, right now, using Phase 5's self-healing logic.
  // If ANYTHING had to change (item removed, quantity capped), we refuse to
  // silently check out on the customer's behalf — this is the concrete
  // enforcement of "never trust totals sent by the frontend" at the exact
  // moment it matters most.
  const cart = await cartService.getFormattedCart(userId);

  if (cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }
  if (cart.removedItems.length > 0 || cart.adjustedItems.length > 0) {
    throw new AppError(
      "Your cart changed since you last viewed it (an item became unavailable or its stock changed). Please review your cart before checking out.",
      409
    );
  }

  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const result = await couponService.validateCoupon(couponCode, cart.subtotal);
    discount = result.discount;
    appliedCoupon = result.coupon;
  }

  const shippingFee = calculateShippingFee(cart.subtotal);
  const total = Math.max(cart.subtotal - discount + shippingFee, 0);

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    productName: item.product.name,
    price: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    session.startTransaction();

    // If ANY item fails here (e.g. someone else bought the last unit
    // between our cart read above and right now), this throws and the
    // catch block below rolls back the ENTIRE transaction — no order is
    // created, no stock is left partially decremented.
    await inventoryService.decrementStock(orderItems, session);

    const [order] = await Order.create(
      [
        {
          customer: userId,
          items: orderItems,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          subtotal: cart.subtotal,
          discount,
          shippingFee,
          total,
          coupon: appliedCoupon ? appliedCoupon._id : null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod,
          paymentStatus: "Pending",
          orderStatus: "Pending",
        },
      ],
      { session }
    );
    createdOrder = order;

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } }, { session });
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await logAction({
    actor: userId,
    action: "ORDER_CREATED",
    targetModel: "Order",
    target: createdOrder._id,
    metadata: { total: createdOrder.total, itemCount: orderItems.length },
  });

  return createdOrder;
};

const CANCELLABLE_STATUSES = ["Pending", "Confirmed"];

export const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) throw new AppError("Order not found", 404);

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw new AppError(
      `This order can no longer be cancelled (current status: ${order.orderStatus})`,
      400
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await inventoryService.restockItems(order.items, session);
    order.orderStatus = "Cancelled";
    if (order.paymentStatus === "Paid") order.paymentStatus = "Refunded";
    await order.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await logAction({
    actor: userId,
    action: "ORDER_CANCELLED",
    targetModel: "Order",
    target: order._id,
    metadata: { total: order.total },
  });

  return order;
};

// Explicit legal state machine — prevents nonsensical transitions like
// "Delivered" back to "Pending," and defines exactly which changes trigger
// a restock (Section 17, 18).
const STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Returned"],
  Delivered: ["Returned"],
  Cancelled: [],
  Returned: [],
};

export const updateOrderStatus = async (actorId, orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const allowedNext = STATUS_TRANSITIONS[order.orderStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Cannot change order status from '${order.orderStatus}' to '${newStatus}'`,
      400
    );
  }

  const previousStatus = order.orderStatus;
  const restockingStatuses = ["Cancelled", "Returned"];

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (restockingStatuses.includes(newStatus)) {
      await inventoryService.restockItems(order.items, session);
      if (order.paymentStatus === "Paid") order.paymentStatus = "Refunded";
    }
    order.orderStatus = newStatus;
    await order.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await logAction({
    actor: actorId,
    action: "ORDER_STATUS_CHANGED",
    targetModel: "Order",
    target: order._id,
    metadata: { from: previousStatus, to: newStatus },
  });

  return order;
};
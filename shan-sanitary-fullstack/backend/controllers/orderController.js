import * as orderService from "../services/orderService.js";
import * as couponService from "../services/couponService.js";
import * as cartService from "../services/cartService.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";
import { calculateShippingFee } from "../services/pricingService.js";
import Order from "../models/Order.js";
import { success, fail } from "../utils/apiResponse.js";

// @route  POST /api/orders/checkout
// @access Protected
export const checkout = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, couponCode } = req.body;
    const order = await orderService.createOrder(req.user._id, { addressId, paymentMethod, couponCode });
    return success(res, 201, "Order placed successfully", order);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/orders/validate-coupon
// @access Protected
// Preview a coupon's discount against the customer's REAL, live cart —
// never trusts a subtotal sent from the frontend (Section 15).
export const validateCouponPreview = async (req, res, next) => {
  try {
    const { code } = req.body;
    const cart = await cartService.getFormattedCart(req.user._id);

    if (cart.items.length === 0) {
      return fail(res, 400, "Your cart is empty");
    }

    const { discount } = await couponService.validateCoupon(code, cart.subtotal);
    const shippingFee = calculateShippingFee(cart.subtotal);
    const estimatedTotal = Math.max(cart.subtotal - discount + shippingFee, 0);

    return success(res, 200, "Coupon is valid", {
      subtotal: cart.subtotal,
      discount,
      shippingFee,
      estimatedTotal,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/orders/my-orders
// @access Protected
export const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ customer: req.user._id }),
    ]);

    return success(res, 200, "Orders retrieved", {
      orders,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/orders/:id
// @access Protected — owner or admin/root_admin
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email");
    if (!order) return fail(res, 404, "Order not found");

    const isOwner = order.customer._id.toString() === req.user._id.toString();
    const isPrivileged = ["admin", "root_admin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return fail(res, 403, "Not authorized to view this order");
    }

    return success(res, 200, "Order retrieved", order);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/orders/:id/cancel
// @access Protected
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user._id, req.params.id);
    return success(res, 200, "Order cancelled successfully", order);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/orders
// @access Protected + admin/root_admin
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return success(res, 200, "Orders retrieved", {
      orders,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/orders/:id/status
// @access Protected + admin/root_admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return fail(res, 400, "New status is required");

    const order = await orderService.updateOrderStatus(req.user._id, req.params.id, status);
    return success(res, 200, "Order status updated successfully", order);
  } catch (error) {
    next(error);
  }
};
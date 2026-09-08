import Coupon from "../models/Coupon.js";
import AppError from "../utils/AppError.js";

// Used by BOTH the checkout flow and the coupon-preview endpoint — one
// source of truth for "is this coupon valid right now, for this subtotal."
export const validateCoupon = async (code, subtotal) => {
  if (!code) throw new AppError("Coupon code is required", 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError("Invalid coupon code", 404);

  const now = new Date();
  if (now < coupon.startDate) throw new AppError("This coupon is not active yet", 400);
  if (now > coupon.expiryDate) throw new AppError("This coupon has expired", 400);

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("This coupon has reached its usage limit", 400);
  }

  if (subtotal < coupon.minimumOrderAmount) {
    throw new AppError(
      `This coupon requires a minimum order of Rs. ${coupon.minimumOrderAmount}`,
      400
    );
  }

  let discount;
  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscount != null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  // A coupon can never discount more than the order is actually worth
  discount = Math.min(discount, subtotal);

  return { coupon, discount: Math.round(discount * 100) / 100 };
};
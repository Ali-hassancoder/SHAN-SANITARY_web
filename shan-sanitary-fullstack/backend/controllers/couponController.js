import Coupon from "../models/Coupon.js";
import { success, fail } from "../utils/apiResponse.js";
import { validateCouponInput } from "../validators/couponValidators.js";
import { logAction } from "../services/auditService.js";

// @route  GET /api/coupons
// @access Protected + admin/root_admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return success(res, 200, "Coupons retrieved", coupons);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/coupons/:id
// @access Protected + admin/root_admin
export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return fail(res, 404, "Coupon not found");
    return success(res, 200, "Coupon retrieved", coupon);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/coupons
// @access Protected + admin/root_admin
export const createCoupon = async (req, res, next) => {
  try {
    const errors = validateCouponInput(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (existing) return fail(res, 400, "A coupon with this code already exists");

    const coupon = await Coupon.create(req.body);

    await logAction({
      actor: req.user._id,
      action: "COUPON_CREATED",
      targetModel: "Coupon",
      target: coupon._id,
      metadata: { code: coupon.code },
    });

    return success(res, 201, "Coupon created successfully", coupon);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/coupons/:id
// @access Protected + admin/root_admin
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return fail(res, 404, "Coupon not found");

    const errors = validateCouponInput(req.body, true);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    Object.assign(coupon, req.body);
    await coupon.save();

    await logAction({
      actor: req.user._id,
      action: "COUPON_UPDATED",
      targetModel: "Coupon",
      target: coupon._id,
      metadata: { code: coupon.code },
    });

    return success(res, 200, "Coupon updated successfully", coupon);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/coupons/:id
// @access Protected + admin/root_admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return fail(res, 404, "Coupon not found");

    // Soft delete — same reasoning as products/categories: orders that
    // already used this coupon (via couponCode snapshot) should still make
    // sense historically, and isActive:false is enough to stop new use.
    coupon.isActive = false;
    await coupon.save();

    await logAction({
      actor: req.user._id,
      action: "COUPON_DELETED",
      targetModel: "Coupon",
      target: coupon._id,
      metadata: { code: coupon.code },
    });

    return success(res, 200, "Coupon deactivated successfully");
  } catch (error) {
    next(error);
  }
};
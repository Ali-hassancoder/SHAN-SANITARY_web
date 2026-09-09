import Review from "../models/Review.js";
import * as reviewService from "../services/reviewService.js";
import { validateReviewInput } from "../validators/reviewValidators.js";
import { success, fail } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";

// @route  GET /api/reviews/product/:productId
// @access Public — approved reviews only
export const getProductReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { product: req.params.productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("customer", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return success(res, 200, "Reviews retrieved", {
      reviews,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/reviews/admin
// @access Protected + admin/root_admin — EVERY review, approved or hidden,
// across every product. This is the moderation queue Section 19/22 needs;
// it didn't exist in Phase 7 because that phase only built the per-product
// public view.
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status === "approved") filter.isApproved = true;
    if (req.query.status === "hidden") filter.isApproved = false;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("customer", "name email")
        .populate("product", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return success(res, 200, "Reviews retrieved", {
      reviews,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/reviews/mine/eligible/:productId
// @access Protected
export const checkReviewEligibility = async (req, res, next) => {
  try {
    const eligibleOrder = await reviewService.getEligibleOrderForReview(
      req.user._id,
      req.params.productId
    );
    return success(res, 200, "Eligibility checked", { eligible: Boolean(eligibleOrder) });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/reviews/product/:productId
// @access Protected
export const createReview = async (req, res, next) => {
  try {
    const errors = validateReviewInput(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    const review = await reviewService.createReview(req.user._id, req.params.productId, req.body);
    return success(res, 201, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/reviews/:id
// @access Protected — owner only
export const updateReview = async (req, res, next) => {
  try {
    const errors = validateReviewInput(req.body, true);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    const review = await reviewService.updateReview(req.user._id, req.params.id, req.body);
    return success(res, 200, "Review updated successfully", review);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/reviews/:id
// @access Protected — owner or admin/root_admin
export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.user, req.params.id);
    return success(res, 200, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/reviews/:id/moderate
// @access Protected + admin/root_admin
export const moderateReview = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== "boolean") {
      return fail(res, 400, "isApproved (true or false) is required");
    }

    const review = await reviewService.moderateReview(req.user._id, req.params.id, isApproved);
    return success(res, 200, `Review ${isApproved ? "approved" : "hidden"} successfully`, review);
  } catch (error) {
    next(error);
  }
};
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { logAction } from "./auditService.js";

// Eligibility rule: one review per DELIVERED order that contained this
// product. Returns the first eligible, not-yet-reviewed order, or null.
export const getEligibleOrderForReview = async (userId, productId) => {
  const orders = await Order.find({
    customer: userId,
    orderStatus: "Delivered",
    "items.product": productId,
  }).sort({ createdAt: -1 });

  for (const order of orders) {
    const alreadyReviewed = await Review.exists({
      customer: userId,
      product: productId,
      order: order._id,
    });
    if (!alreadyReviewed) return order;
  }
  return null;
};

// The ONE place that recalculates a product's public rating summary.
// Called after any create/update/delete/moderation that changes which
// reviews count as approved — never trust a value that could go stale.
export const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avgRating, count } = stats[0] || { avgRating: 0, count: 0 };

  await Product.findByIdAndUpdate(productId, {
    ratings: Math.round(avgRating * 10) / 10, // one decimal place
    reviewCount: count,
  });
};

export const createReview = async (userId, productId, { rating, comment }) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new AppError("Product not found", 404);

  const eligibleOrder = await getEligibleOrderForReview(userId, productId);
  if (!eligibleOrder) {
    throw new AppError(
      "You can only review a product after it has been delivered to you, and only once per order",
      403
    );
  }

  const review = await Review.create({
    customer: userId,
    product: productId,
    order: eligibleOrder._id,
    rating,
    comment,
  });

  await recalculateProductRating(productId);
  return review;
};

export const updateReview = async (userId, reviewId, { rating, comment }) => {
  const review = await Review.findOne({ _id: reviewId, customer: userId });
  if (!review) throw new AppError("Review not found", 404);

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  await recalculateProductRating(review.product);
  return review;
};

export const deleteReview = async (actor, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  const isOwner = review.customer.toString() === actor._id.toString();
  const isPrivileged = ["admin", "root_admin"].includes(actor.role);

  if (!isOwner && !isPrivileged) {
    throw new AppError("Not authorized to delete this review", 403);
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  if (!isOwner) {
    await logAction({
      actor: actor._id,
      action: "REVIEW_DELETED_BY_ADMIN",
      targetModel: "Review",
      target: reviewId,
      metadata: { productId },
    });
  }

  return true;
};

// Moderation = HIDE, not delete. Section 19 asks admins to moderate
// inappropriate reviews — flipping isApproved keeps the record (and the
// customer's original words) intact for accountability, while removing it
// from public view and from the rating average. Actual deletion is a
// separate, more destructive action (deleteReview above).
export const moderateReview = async (actorId, reviewId, isApproved) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  review.isApproved = isApproved;
  await review.save();
  await recalculateProductRating(review.product);

  await logAction({
    actor: actorId,
    action: isApproved ? "REVIEW_APPROVED" : "REVIEW_HIDDEN",
    targetModel: "Review",
    target: review._id,
    metadata: { productId: review.product },
  });

  return review;
};
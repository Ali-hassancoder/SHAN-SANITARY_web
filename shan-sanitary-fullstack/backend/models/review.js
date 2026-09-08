import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // eligibility: must have purchased via this order
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: true, // auto-approved; admins can moderate/hide (Section 19)
    },
  },
  { timestamps: true }
);

// Eligibility rule (Section 19): one review per product PER ORDER
reviewSchema.index({ customer: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
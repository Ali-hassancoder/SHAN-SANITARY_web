import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  moderateReview,
  checkReviewEligibility,
} from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews); // public
router.post("/product/:productId", authenticate, createReview);
router.get("/mine/eligible/:productId", authenticate, checkReviewEligibility);
router.patch("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);
router.patch("/:id/moderate", authenticate, authorize("admin", "root_admin"), moderateReview);

export default router;
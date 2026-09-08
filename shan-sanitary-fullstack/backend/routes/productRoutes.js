import express from "express";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/slug/:slug/related", getRelatedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/", getProducts);
router.get("/:id", authenticate, authorize("admin", "root_admin"), getProductById);

router.post("/", authenticate, authorize("admin", "root_admin"), createProduct);
router.patch("/:id", authenticate, authorize("admin", "root_admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin", "root_admin"), deleteProduct);

export default router;
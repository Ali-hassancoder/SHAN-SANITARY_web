import express from "express";
import {
  getProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getRelatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific string routes registered BEFORE the generic /:id — same rule
// as every previous phase.
router.get("/admin", authenticate, authorize("admin", "root_admin"), getAllProductsAdmin);
router.get("/slug/:slug/related", getRelatedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/", getProducts);
router.get("/:id", authenticate, authorize("admin", "root_admin"), getProductById);

router.post("/", authenticate, authorize("admin", "root_admin"), createProduct);
router.patch("/:id", authenticate, authorize("admin", "root_admin"), updateProduct);
router.patch("/:id/reactivate", authenticate, authorize("admin", "root_admin"), reactivateProduct);
router.delete("/:id", authenticate, authorize("admin", "root_admin"), deleteProduct);

export default router;
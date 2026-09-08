import express from "express";
import {
  getCategories,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: specific string routes before the generic /:id — same rule
// you learned in your last project, applies again here.
router.get("/admin", authenticate, authorize("admin", "root_admin"), getAllCategoriesAdmin);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/", getCategories);
router.get("/:id", authenticate, authorize("admin", "root_admin"), getCategoryById);

router.post("/", authenticate, authorize("admin", "root_admin"), createCategory);
router.patch("/:id", authenticate, authorize("admin", "root_admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin", "root_admin"), deleteCategory);

export default router;

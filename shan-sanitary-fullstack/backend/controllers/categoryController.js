import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { success, fail } from "../utils/apiResponse.js";
import { buildCategoryTree } from "../utils/buildCategoryTree.js";
import { validateCategoryInput } from "../validators/categoryValidators.js";
import { logAction } from "../services/auditService.js";

// @route  GET /api/categories
// @access Public — ACTIVE categories only
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    if (req.query.tree === "true") {
      return success(res, 200, "Categories retrieved", buildCategoryTree(categories));
    }

    return success(res, 200, "Categories retrieved", categories);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/categories/admin
// @access Protected + admin/root_admin — includes INACTIVE categories
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    if (req.query.tree === "true") {
      return success(res, 200, "Categories retrieved", buildCategoryTree(categories));
    }

    return success(res, 200, "Categories retrieved", categories);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/categories/slug/:slug
// @access Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return fail(res, 404, "Category not found");
    return success(res, 200, "Category retrieved", category);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/categories/:id
// @access Protected + admin/root_admin
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return fail(res, 404, "Category not found");
    return success(res, 200, "Category retrieved", category);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/categories
// @access Protected + admin/root_admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, parent, description, image } = req.body;

    const errors = validateCategoryInput(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) return fail(res, 400, "Parent category does not exist");
    }

    const category = await Category.create({ name, parent: parent || null, description, image });

    await logAction({
      actor: req.user._id,
      action: "CATEGORY_CREATED",
      targetModel: "Category",
      target: category._id,
      metadata: { name: category.name },
    });

    return success(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/categories/:id
// @access Protected + admin/root_admin
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return fail(res, 404, "Category not found");

    const errors = validateCategoryInput(req.body, true);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    const { parent } = req.body;

    // Prevent a category from becoming its own parent (direct self-reference)
    if (parent && parent === req.params.id) {
      return fail(res, 400, "A category cannot be its own parent");
    }

    // Prevent a deeper cycle: walk up the proposed new parent's ancestor chain
    // and make sure this category doesn't appear in it.
    if (parent) {
      let current = await Category.findById(parent);
      const visited = new Set();
      while (current && current.parent) {
        if (current.parent.toString() === req.params.id) {
          return fail(res, 400, "This change would create a circular category structure");
        }
        if (visited.has(current._id.toString())) break; // safety valve against bad data
        visited.add(current._id.toString());
        current = await Category.findById(current.parent);
      }
    }

    const beforeSnapshot = { name: category.name, parent: category.parent };

    Object.assign(category, req.body);
    await category.save();

    await logAction({
      actor: req.user._id,
      action: "CATEGORY_UPDATED",
      targetModel: "Category",
      target: category._id,
      metadata: { before: beforeSnapshot, after: { name: category.name, parent: category.parent } },
    });

    return success(res, 200, "Category updated successfully", category);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/categories/:id
// @access Protected + admin/root_admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return fail(res, 404, "Category not found");

    const hasActiveChildren = await Category.exists({ parent: category._id, isActive: true });
    if (hasActiveChildren) {
      return fail(res, 400, "Cannot delete a category that has active subcategories");
    }

    const hasActiveProducts = await Product.exists({ category: category._id, isActive: true });
    if (hasActiveProducts) {
      return fail(res, 400, "Cannot delete a category that still has active products. Reassign or deactivate them first.");
    }

    category.isActive = false;
    await category.save();

    await logAction({
      actor: req.user._id,
      action: "CATEGORY_DELETED",
      targetModel: "Category",
      target: category._id,
      metadata: { name: category.name },
    });

    return success(res, 200, "Category deactivated successfully");
  } catch (error) {
    next(error);
  }
};
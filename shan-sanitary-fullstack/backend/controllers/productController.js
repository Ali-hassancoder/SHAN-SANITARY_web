import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { success, fail } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";
import { buildProductFilter, buildProductSort } from "../utils/queryHelpers.js";
import { validateProductInput } from "../validators/productValidators.js";
import { logAction } from "../services/auditService.js";

// @route  GET /api/products
// @access Public
export const getProducts = async (req, res, next) => {
  try {
    // Allow filtering by category SLUG in the URL (frontend-friendly) —
    // resolve it to an _id before handing off to the shared filter builder.
    const queryForFilter = { ...req.query };
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category, isActive: true });
      if (!category) {
        // A nonexistent category slug should return an empty result set,
        // not an error — this is a normal "no products" case, not a bug.
        return success(res, 200, "Products retrieved", {
          products: [],
          pagination: buildPaginationMeta(0, 1, 20),
        });
      }
      queryForFilter.category = category._id.toString();
    }

    const filter = buildProductFilter(queryForFilter);
    const hasSearch = Boolean(req.query.search);
    const sort = buildProductSort(req.query.sort, hasSearch);
    const { page, limit, skip } = getPagination(req.query);

    const projection = hasSearch ? { score: { $meta: "textScore" } } : {};

    const [products, total] = await Promise.all([
      Product.find(filter, projection)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return success(res, 200, "Products retrieved", {
      products,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/slug/:slug
// @access Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      "category",
      "name slug"
    );

    if (!product) return fail(res, 404, "Product not found");

    return success(res, 200, "Product retrieved", product);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:slug/related
// @access Public — same category, excluding itself
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return fail(res, 404, "Product not found");

    const related = await Product.find({
      category: product.category,
      isActive: true,
      _id: { $ne: product._id },
    })
      .limit(8)
      .populate("category", "name slug");

    return success(res, 200, "Related products retrieved", related);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:id
// @access Protected + admin/root_admin — fetch raw product (any status) for editing
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug");
    if (!product) return fail(res, 404, "Product not found");
    return success(res, 200, "Product retrieved", product);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/products
// @access Protected + admin/root_admin
export const createProduct = async (req, res, next) => {
  try {
    const errors = validateProductInput(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    const { category, sku } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return fail(res, 400, "Selected category does not exist");

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) return fail(res, 400, "A product with this SKU already exists");

    const product = await Product.create(req.body);

    await logAction({
      actor: req.user._id,
      action: "PRODUCT_CREATED",
      targetModel: "Product",
      target: product._id,
      metadata: { name: product.name, sku: product.sku },
    });

    return success(res, 201, "Product created successfully", product);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/products/:id
// @access Protected + admin/root_admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, 404, "Product not found");

    const errors = validateProductInput(req.body, true);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) return fail(res, 400, "Selected category does not exist");
    }

    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingSku) return fail(res, 400, "Another product already uses this SKU");
    }

    const beforeSnapshot = { price: product.price, stock: product.stock, isActive: product.isActive };

    Object.assign(product, req.body);
    await product.save({ validateBeforeSave: true }); // runs schema validators, e.g. salePrice < price

    await logAction({
      actor: req.user._id,
      action: "PRODUCT_UPDATED",
      targetModel: "Product",
      target: product._id,
      metadata: {
        before: beforeSnapshot,
        after: { price: product.price, stock: product.stock, isActive: product.isActive },
      },
    });

    return success(res, 200, "Product updated successfully", product);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/products/:id
// @access Protected + admin/root_admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, 404, "Product not found");

    // SOFT delete, deliberately — see explanation below.
    product.isActive = false;
    await product.save();

    await logAction({
      actor: req.user._id,
      action: "PRODUCT_DELETED",
      targetModel: "Product",
      target: product._id,
      metadata: { name: product.name, sku: product.sku },
    });

    return success(res, 200, "Product deactivated successfully");
  } catch (error) {
    next(error);
  }
};
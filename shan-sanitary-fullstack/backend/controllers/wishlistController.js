import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import * as cartService from "../services/cartService.js";
import { success, fail } from "../utils/apiResponse.js";

const getOrCreateWishlist = async (userId) => {
  return Wishlist.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, products: [] } },
    { upsert: true, new: true }
  );
};

// @route  GET /api/wishlist
// @access Protected
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    await wishlist.populate({
      path: "products",
      match: { isActive: true }, // silently excludes deactivated products from the result
      select: "name slug price salePrice images stock ratings",
    });

    // Same self-healing idea as the cart: if a product was deactivated,
    // clean the stale reference out of the stored document so future
    // reads don't need to keep re-filtering it.
    const activeIds = wishlist.products.map((p) => p._id.toString());
    const rawWishlist = await Wishlist.findOne({ user: req.user._id });
    if (rawWishlist.products.length !== activeIds.length) {
      rawWishlist.products = rawWishlist.products.filter((id) => activeIds.includes(id.toString()));
      await rawWishlist.save();
    }

    return success(res, 200, "Wishlist retrieved", wishlist.products);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/wishlist/:productId
// @access Protected
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return fail(res, 404, "Product not found");

    const wishlist = await getOrCreateWishlist(req.user._id);
    const alreadyIn = wishlist.products.some((id) => id.toString() === productId);
    if (!alreadyIn) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return success(res, 200, "Product added to wishlist");
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/wishlist/:productId
// @access Protected
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    return success(res, 200, "Product removed from wishlist");
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/wishlist/:productId/move-to-cart
// @access Protected
export const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity) || 1;

    // Reuses the SAME cart service logic — same stock checks, same pricing
    // recalculation — rather than duplicating add-to-cart logic here.
    const cart = await cartService.addItemToCart(req.user._id, productId, quantity);

    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return success(res, 200, "Product moved to cart", cart);
  } catch (error) {
    next(error);
  }
};
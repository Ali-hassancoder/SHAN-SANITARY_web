import * as cartService from "../services/cartService.js";
import { success, fail } from "../utils/apiResponse.js";

// @route  GET /api/cart
// @access Protected
export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getFormattedCart(req.user._id);
    return success(res, 200, "Cart retrieved", cart);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/cart
// @access Protected
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return fail(res, 400, "productId is required");

    const cart = await cartService.addItemToCart(req.user._id, productId, Number(quantity) || 1);
    return success(res, 200, "Item added to cart", cart);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/cart/:productId
// @access Protected
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(
      req.user._id,
      req.params.productId,
      Number(quantity)
    );
    return success(res, 200, "Cart updated", cart);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/cart/:productId
// @access Protected
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(req.user._id, req.params.productId);
    return success(res, 200, "Item removed from cart", cart);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/cart
// @access Protected
export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCartItems(req.user._id);
    return success(res, 200, "Cart cleared", cart);
  } catch (error) {
    next(error);
  }
};
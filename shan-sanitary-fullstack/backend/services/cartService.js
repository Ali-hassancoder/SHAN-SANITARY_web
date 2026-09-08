import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

// Atomic find-or-create — avoids a race condition where two near-simultaneous
// requests both see "no cart exists" and both try to create one, which would
// violate the schema's unique: true on Cart.user.
const getOrCreateCart = async (userId) => {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, new: true }
  );
};

const computeUnitPrice = (product) => {
  if (product.salePrice != null && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
};

// THE core function of this phase. Every cart read goes through here.
// It recalculates pricing from the live Product data (never trusts anything
// stored on the cart itself, because nothing but productId+quantity IS
// stored there — see Cart.js's design note from Phase 2), and self-heals
// the stored cart document if reality has changed since items were added.
export const getFormattedCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate("items.product");

  const validItems = [];
  const removedItems = []; // deactivated or deleted products
  const adjustedItems = []; // quantity reduced because stock dropped

  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      removedItems.push({
        productId: item.product?._id || item.product,
        reason: "This product is no longer available",
      });
      continue;
    }

    if (product.stock === 0) {
      removedItems.push({ productId: product._id, name: product.name, reason: "Out of stock" });
      continue;
    }

    let quantity = item.quantity;
    if (quantity > product.stock) {
      adjustedItems.push({
        productId: product._id,
        name: product.name,
        requestedQuantity: quantity,
        adjustedQuantity: product.stock,
      });
      quantity = product.stock;
    }

    const unitPrice = computeUnitPrice(product);
    const itemSubtotal = unitPrice * quantity;
    subtotal += itemSubtotal;

    validItems.push({
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
      },
      quantity,
      unitPrice,
      subtotal: itemSubtotal,
    });
  }

  // Persist the corrections back to the actual database document, so the
  // NEXT read is already clean — we don't want to recompute "is this item
  // still valid" from scratch on every single request forever.
  if (removedItems.length > 0 || adjustedItems.length > 0) {
    const validIds = validItems.map((v) => v.product._id.toString());
    cart.items = cart.items.filter((item) => {
      const id = (item.product?._id || item.product).toString();
      return validIds.includes(id);
    });
    for (const adj of adjustedItems) {
      const cartItem = cart.items.find(
        (i) => (i.product._id || i.product).toString() === adj.productId.toString()
      );
      if (cartItem) cartItem.quantity = adj.adjustedQuantity;
    }
    await cart.save();
  }

  return {
    items: validItems,
    subtotal,
    itemCount: validItems.reduce((sum, i) => sum + i.quantity, 0),
    removedItems, // frontend should show these as a dismissible notice
    adjustedItems, // e.g. "we reduced Chrome Wash Basin to 3 — only 3 left in stock"
  };
};

export const addItemToCart = async (userId, productId, quantity) => {
  if (!quantity || quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  const currentQty = existingItem ? existingItem.quantity : 0;
  const desiredQty = currentQty + quantity;

  if (desiredQty > product.stock) {
    throw new AppError(
      `Only ${product.stock} in stock${currentQty > 0 ? ` (you already have ${currentQty} in your cart)` : ""}`,
      400
    );
  }

  if (existingItem) {
    existingItem.quantity = desiredQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return getFormattedCart(userId);
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  if (!quantity || quantity < 1) {
    throw new AppError("Quantity must be at least 1 — use the remove endpoint to delete an item", 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }
  if (quantity > product.stock) {
    throw new AppError(`Only ${product.stock} in stock`, 400);
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError("This product is not in your cart", 404);

  item.quantity = quantity;
  await cart.save();
  return getFormattedCart(userId);
};

export const removeCartItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return getFormattedCart(userId);
};

export const clearCartItems = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return getFormattedCart(userId);
};
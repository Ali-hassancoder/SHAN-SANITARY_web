import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

export const decrementStock = async (items, session) => {
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity }, isActive: true },
      { $inc: { stock: -item.quantity } },
      { session, new: true }
    );

    if (!updated) {
      throw new AppError(
        `${item.productName || "A product"} in your order no longer has enough stock`,
        409
      );
    }
  }
};

export const restockItems = async (items, session) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
  }
};

// Read the threshold at call time, not at module-load time — avoids any
// dependency on exactly when dotenv.config() finishes relative to this
// file being imported.
const getLowStockThreshold = () => Number(process.env.INVENTORY_LOW_STOCK_THRESHOLD) || 5;

// @used by GET /api/inventory/summary (Section 18's dashboard requirement)
export const getInventorySummary = async () => {
  const threshold = getLowStockThreshold();

  const [totalProducts, outOfStock, lowStock, inStock] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: threshold } }),
    Product.countDocuments({ isActive: true, stock: { $gt: threshold } }),
  ]);

  return { totalProducts, inStock, lowStock, outOfStock, lowStockThreshold: threshold };
};

export const getLowStockProducts = async ({ skip, limit }) => {
  const threshold = getLowStockThreshold();
  const filter = { isActive: true, stock: { $gt: 0, $lte: threshold } };

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ stock: 1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { products, total };
};

export const getOutOfStockProducts = async ({ skip, limit }) => {
  const filter = { isActive: true, stock: 0 };

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { products, total };
};
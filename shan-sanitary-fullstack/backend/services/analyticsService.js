import Order from "../models/Order.js";
import User from "../models/User.js"; 
import Product from "../models/Product.js";

const REVENUE_EXCLUDED_STATUSES = ["cancelled", "Returned"] ;

export const getDashboardSummary = async () => {
    const [
         revenueAgg,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    ] = await promise.all([
        Order.aggergate([
            { $match: { orderstatus: { $nin: REVENUE_EXCLUDED_STATUSES} } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.countDoucument(),
        User.countDocuments({ role: "customer" }),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments({ orderStatus: "Processing"}),
        Order.countDocuments({ orderStatus: "Devlivered" }),
    ]);

    return {
        totalRevenue: revenueAgg[0]?.total || 0,
        totalOrders,
        totalProducts,
        pendingOrders,
        processingOrders,
        deliveredOrders,
    };
};

export const getSalesOverTime = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const results = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, orderStatus: { $nin: REVENUE_EXCLUDED_STATUSES } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
};

export const getTopProducts = async (limit = 5) => {
  return Order.aggregate([
    { $match: { orderStatus: { $nin: REVENUE_EXCLUDED_STATUSES } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.productName" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);
};

export const getCategoryPerformance = async () => {
    const results = await Order.aggregate([
         { $match: { orderStatus: { $nin: REVENUE_EXCLUDED_STATUSES } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
        revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { revenue: -1 } },
    ]);

    return result.map((r) => ({ category: r._id, revenue: r.revenue }));
};
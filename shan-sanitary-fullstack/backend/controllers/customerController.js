import User from "../models/User.js";
import Order from "../models/Order.js";
import { success, fail } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";
import { logAction } from "../services/auditService.js";

// Same exclusion rule as analyticsService.js (Phase 11) — kept consistent
// so "Total Spent" here always agrees with dashboard revenue figures.
const REVENUE_EXCLUDED_STATUSES = ["Cancelled", "Returned"];

// @route  GET /api/customers
// @access Protected + admin/root_admin
export const getCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { role: "customer" };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.status === "active") filter.isActive = true;
    if (req.query.status === "inactive") filter.isActive = false;

    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    // Order stats are computed separately (Order collection) and merged in —
    // a customer with zero orders should still show "0 orders / Rs. 0 spent",
    // not be silently missing stats or causing a lookup error.
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
          orderStatus: { $nin: REVENUE_EXCLUDED_STATUSES },
        },
      },
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = { orderCount: s.orderCount, totalSpent: s.totalSpent };
    });

    const enrichedCustomers = customers.map((c) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isActive: c.isActive,
      createdAt: c.createdAt,
      orderCount: statsMap[c._id.toString()]?.orderCount || 0,
      totalSpent: statsMap[c._id.toString()]?.totalSpent || 0,
    }));

    return success(res, 200, "Customers retrieved", {
      customers: enrichedCustomers,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/customers/:id
// @access Protected + admin/root_admin
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return fail(res, 404, "Customer not found");

    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(20);

    return success(res, 200, "Customer retrieved", { customer, recentOrders: orders });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/customers/:id/status
// @access Protected + admin/root_admin
// Toggling isActive here is the SAME mechanism authMiddleware.authenticate
// checks on every request (Phase 3) — disabling a customer here takes
// effect on their very next API call, not just at their next login.
export const toggleCustomerStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return fail(res, 400, "isActive (true or false) is required");

    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) return fail(res, 404, "Customer not found");

    customer.isActive = isActive;
    await customer.save();

    await logAction({
      actor: req.user._id,
      action: isActive ? "CUSTOMER_ENABLED" : "CUSTOMER_DISABLED",
      targetModel: "User",
      target: customer._id,
      metadata: { email: customer.email },
    });

    return success(res, 200, `Customer ${isActive ? "enabled" : "disabled"} successfully`);
  } catch (error) {
    next(error);
  }
};
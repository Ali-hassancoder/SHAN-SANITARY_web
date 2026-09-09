import * as analyticsService from "../services/analyticsService.js";
import { success } from "../utils/apiResponse.js";

// @route  GET /api/dashboard/summary
export const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getDashboardSummary();
    return success(res, 200, "Dashboard summary retrieved", summary);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/sales-over-time?days=30
export const getSalesOverTime = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const data = await analyticsService.getSalesOverTime(days);
    return success(res, 200, "Sales data retrieved", data);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/top-products?limit=5
export const getTopProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const data = await analyticsService.getTopProducts(limit);
    return success(res, 200, "Top products retrieved", data);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/category-performance
export const getCategoryPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryPerformance();
    return success(res, 200, "Category performance retrieved", data);
  } catch (error) {
    next(error);
  }
};
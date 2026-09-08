import * as inventoryService from "../services/inventoryService.js";
import { success } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";

// @route  GET /api/inventory/summary
// @access Protected + admin/root_admin
export const getSummary = async (req, res, next) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    return success(res, 200, "Inventory summary retrieved", summary);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/inventory/low-stock
// @access Protected + admin/root_admin
export const listLowStock = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { products, total } = await inventoryService.getLowStockProducts({ skip, limit });
    return success(res, 200, "Low stock products retrieved", {
      products,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/inventory/out-of-stock
// @access Protected + admin/root_admin
export const listOutOfStock = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { products, total } = await inventoryService.getOutOfStockProducts({ skip, limit });
    return success(res, 200, "Out of stock products retrieved", {
      products,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

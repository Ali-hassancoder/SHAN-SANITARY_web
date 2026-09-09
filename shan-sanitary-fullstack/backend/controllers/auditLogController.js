import AuditLog from "../models/AuditLog.js";
import { success } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";


export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.action) filter.action = req.query.action;
    if (req.query.actor) filter.actor = req.query.actor;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return success(res, 200, "Audit logs retrieved", {
      logs,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};
import * as settingsService from "../services/settingService.js";
import { success, fail } from "../utils/apiResponse.js";
import { logAction } from "../services/auditService.js";

// @route  GET /api/settings
// @access Protected + root_admin only
export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return success(res, 200, "Settings retrieved", settings);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/settings
// @access Protected + root_admin only
export const updateSettings = async (req, res, next) => {
  try {
    const { lowStockThreshold } = req.body;

    if (lowStockThreshold !== undefined && (isNaN(lowStockThreshold) || lowStockThreshold < 0)) {
      return fail(res, 400, "Low stock threshold must be a non-negative number");
    }

    const updates = {};
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = Number(lowStockThreshold);

    const settings = await settingsService.updateSettings(updates);

    await logAction({
      actor: req.user._id,
      action: "SETTINGS_UPDATED",
      targetModel: "Settings",
      target: settings._id,
      metadata: updates,
    });

    return success(res, 200, "Settings updated successfully", settings);
  } catch (error) {
    next(error);
  }
};
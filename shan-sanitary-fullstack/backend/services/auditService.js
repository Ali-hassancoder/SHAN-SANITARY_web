import AuditLog from "../models/AuditLog.js";

// Called internally by other services/controllers — never exposed as its own
// public API endpoint. This is the ONLY function in the entire app that
// writes to the AuditLog collection.
export const logAction = async ({ actor, action, targetModel, target, metadata = {} }) => {
  try {
    await AuditLog.create({ actor, action, targetModel, target, metadata });
  } catch (error) {
    // Audit logging must NEVER crash or block the primary operation it's
    // attached to (e.g. a product being created shouldn't fail just because
    // logging that fact failed). We log the failure to the server console
    // instead of throwing, and swallow it here.
    console.error("Audit log failed:", error.message);
  }
};
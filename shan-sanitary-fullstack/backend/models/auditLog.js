import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "ADMIN_CREATED", "PRODUCT_DELETED", "ORDER_STATUS_CHANGED"
    },
    targetModel: {
      type: String, // e.g. "User", "Product", "Order"
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // flexible: before/after values, extra context
      default: {},
    },
  },
  { timestamps: true } // createdAt effectively serves as "timestamp"
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

// No update or delete methods are exposed anywhere in the app —
// audit logs are insert-only by design (Section 26: "must not be casually
// editable or deletable"). This is enforced by never writing an
// updateAuditLog/deleteAuditLog controller at all, not by a schema flag.

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
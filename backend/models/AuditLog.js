import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "RESTORE", "LOGIN", "LOGOUT", "OTHER"],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["PatientBill", "Expense", "Income", "User", "Settings"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityType",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed },
      after: { type: mongoose.Schema.Types.Mixed },
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Indexes for performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

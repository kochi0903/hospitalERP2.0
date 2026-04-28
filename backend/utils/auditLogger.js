import AuditLog from "../models/AuditLog.js";

/**
 * Logs a user activity to the database
 */
export const logActivity = async ({
  action,
  entityType,
  entityId,
  performedBy,
  details,
  changes,
  req,
}) => {
  try {
    const logData = {
      action,
      entityType,
      entityId,
      performedBy,
      details,
      changes,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress || "unknown",
    };

    await AuditLog.create(logData);
  } catch (error) {
    console.error("Audit Logging Error:", error);
    // Non-blocking: we don't want to crash the main request if logging fails
  }
};

/**
 * Calculates the delta between two objects for tracking changes
 * @param {Object} oldData - The original document
 * @param {Object} newData - The updated document
 * @param {Array} fieldsToTrack - List of fields to compare
 * @returns {Object|null} - { before, after } or null if no changes
 */
export const calculateDelta = (oldData, newData, fieldsToTrack) => {
  const before = {};
  const after = {};
  let hasChanges = false;

  fieldsToTrack.forEach((field) => {
    const oldVal = oldData[field];
    const newVal = newData[field];

    // Simple comparison for primitives and dates
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      before[field] = oldVal;
      after[field] = newVal;
      hasChanges = true;
    }
  });

  return hasChanges ? { before, after } : null;
};

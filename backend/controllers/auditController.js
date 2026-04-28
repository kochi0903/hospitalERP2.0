import AuditLog from "../models/AuditLog.js";

/**
 * @desc    Get all audit logs (Admin only)
 * @route   GET /api/audit
 * @access  Private/Admin
 */
export const getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Filters
    if (req.query.action) query.action = req.query.action;
    if (req.query.entityType) query.entityType = req.query.entityType;
    if (req.query.performedBy) query.performedBy = req.query.performedBy;
    
    // Date Range Filter
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) query.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.timestamp.$lte = new Date(req.query.endDate);
    }

    const logs = await AuditLog.find(query)
      .populate("performedBy", "name email role")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get logs for a specific entity
 * @route   GET /api/audit/entity/:entityType/:entityId
 * @access  Private/Admin
 */
export const getEntityLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await AuditLog.find({ entityType, entityId })
      .populate("performedBy", "name email role")
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

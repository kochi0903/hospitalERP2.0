/**
 * Middleware to enforce an edit-lock window for non-admin users.
 * Prevents modifications to records older than EDIT_LOCK_DAYS.
 */
const checkEditLock = (Model) => async (req, res, next) => {
  try {
    // Admins bypass the lock entirely
    if (req.user && req.user.role === "admin") {
      return next();
    }

    const record = await Model.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    const lockDays = parseInt(process.env.EDIT_LOCK_DAYS) || 7;
    const lockTime = lockDays * 24 * 60 * 60 * 1000;
    const recordAge = Date.now() - new Date(record.createdAt).getTime();

    if (recordAge > lockTime) {
      return res.status(403).json({
        success: false,
        message: `This record is locked. Edits and deletions are only allowed within ${lockDays} days of creation. Please contact an admin for assistance.`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking edit lock",
      error: error.message,
    });
  }
};

export default checkEditLock;

import Settings from "../models/Settings.js";

/**
 * Middleware to enforce the data entry window for non-admin users.
 * Rejects create/update requests where the date field falls outside the allowed window.
 *
 * @param {string} dateField - The request body field name containing the date (e.g., "date", "admissionDate")
 */
const checkDateWindow = (dateField = "date") => async (req, res, next) => {
  try {
    // Admins bypass the date window
    if (req.user && req.user.role === "admin") {
      return next();
    }

    const dateValue = req.body[dateField];
    if (!dateValue) {
      return next(); // Let schema validation handle missing dates
    }

    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) {
      return next(); // Let schema validation handle invalid dates
    }

    // Fetch the configured window (default 7 days)
    const setting = await Settings.findOne({ key: "dataEntryWindowDays" });
    const windowDays = setting ? parseInt(setting.value, 10) : 7;

    const now = new Date();
    const minDate = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    minDate.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setHours(23, 59, 59, 999);

    if (parsed < minDate || parsed > maxDate) {
      return res.status(400).json({
        error: `Date must be within the last ${windowDays} days. Allowed range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}.`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Error validating date window",
    });
  }
};

export default checkDateWindow;

import Settings from "../models/Settings.js";

// Default settings - used to seed if missing
const DEFAULT_SETTINGS = {
  dataEntryWindowDays: {
    value: 7,
    description: "Number of days back accountants can enter expense/income data",
  },
};

/**
 * @desc    Get all settings (authenticated users)
 * @route   GET /api/settings
 * @access  Private
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();

    // Convert array to key-value object for easy frontend consumption
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    // Fill in defaults for any missing settings
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      if (result[key] === undefined) {
        result[key] = def.value;
      }
    }

    res.json({ settings: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Update a setting (admin only)
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: "Both key and value are required" });
    }

    // Validate known settings
    if (key === "dataEntryWindowDays") {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1 || numValue > 365) {
        return res.status(400).json({
          error: "dataEntryWindowDays must be a number between 1 and 365",
        });
      }
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        key,
        value,
        description: DEFAULT_SETTINGS[key]?.description || "",
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: "Setting updated successfully", setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Setting key is required"],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Setting value is required"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

settingsSchema.index({ key: 1 });

export default mongoose.model("Settings", settingsSchema);

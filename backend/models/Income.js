import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Income source is required"],
      enum: {
        values: ["Patient Billing", "Insurance", "Donation", "Other"],
        message: "{VALUE} is not a valid income source",
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: "Amount must be a positive number",
      },
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientBill",
      validate: {
        validator: async function (value) {
          if (this.source === "Patient Billing") {
            const bill = await mongoose.model("PatientBill").findById(value);
            return bill !== null;
          }
          return true;
        },
        message: "Referenced patient bill does not exist",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Global filter for soft-deleted records
incomeSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Virtual to get the associated bill details if source is Patient Billing
incomeSchema.virtual("billDetails", {
  ref: "PatientBill",
  localField: "referenceId",
  foreignField: "_id",
  justOne: true,
});

// Index for faster queries
incomeSchema.index({ createdAt: -1 });
incomeSchema.index({ source: 1, createdAt: -1 });

// Pre-save middleware to validate referenceId based on source
incomeSchema.pre("save", function (next) {
  if (this.source === "Patient Billing" && !this.referenceId) {
    next(new Error("Reference ID is required for Patient Billing income"));
  }
  next();
});

export default mongoose.model("Income", incomeSchema);

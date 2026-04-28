import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Service description is required"],
    trim: true,
    minlength: [3, "Description must be at least 3 characters long"],
  },
  cost: {
    type: Number,
    required: [true, "Service cost is required"],
    min: [0, "Cost cannot be negative"],
  },
});

const patientBillSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters long"],
    },
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
    },
    services: {
      type: [serviceSchema],
      validate: {
        validator: function (services) {
          return services.length > 0;
        },
        message: "At least one service must be added to the bill",
      },
    },
    address: {
      type: String,
      required: [true, "Patient address is required"],
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      validate: {
        validator: function (value) {
          if (!Array.isArray(this.services)) return true; // Skip if services is not an array
          return (
            value ===
            this.services.reduce((sum, service) => sum + service.cost, 0)
          );
        },
        message: "Total amount must match the sum of service costs",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bill creator is required"],
    },
    dischargeDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (date) {
          return date <= new Date();
        },
        message: "Bill date cannot be in the future",
      },
    },
    pdfUrl: {
      type: String,
      match: [/^https?:\/\/.*\.pdf$/, "Invalid PDF URL format"],
    },
    status: {
      type: String,
      enum: {
        values: ["due", "paid"],
        message: "{VALUE} is not a valid status",
      },
      default: "due",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cash", "bank"],
        message: "{VALUE} is not a valid payment method",
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
patientBillSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Virtual for payment status
patientBillSchema.virtual("paymentStatus").get(function () {
  if (this.remainingAmount === 0) return "paid";
  if (this.remainingAmount === this.totalAmount) return "due";
});

// Index for faster queries
patientBillSchema.index({ patientId: 1 });
patientBillSchema.index({ status: 1, dischargeDate: -1 });
patientBillSchema.index({ isDeleted: 1 });

export default mongoose.model("PatientBill", patientBillSchema);

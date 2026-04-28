import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    amount: { 
      type: Number, 
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Amount must be a positive number'
      }
    },
    category: { 
      type: String,
      required: [true, 'Category is required'],
    },
    incurredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: [true, 'User who incurred the expense is required']
    },
    date: { 
      type: Date, 
      default: Date.now,
      validate: {
        validator: function(date) {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - 180);
          return date <= new Date() && date >= daysAgo;
        },
        message: 'Expense date must be within the last 180 days and cannot be in the future'
      }
    },
    remarks: { 
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['cash', 'upi/bank'],
        message: '{VALUE} is not a valid payment mode'
      }
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
    toObject: { virtuals: true }
  }
);

// Global filter for soft-deleted records
expenseSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Virtual to get the approver details
expenseSchema.virtual('approverDetails', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

// Virtual to calculate age of expense
expenseSchema.virtual('expenseAge').get(function() {
  return Math.floor((new Date() - this.date) / (1000 * 60 * 60 * 24));
});

// Index for faster queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ incurredBy: 1});
expenseSchema.index({ isDeleted: 1 });

export default mongoose.model("Expense", expenseSchema);

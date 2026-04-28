import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    passwordHash: { 
      type: String, 
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "accountant", "doctor"],
        message: '{VALUE} is not a valid role'
      },
      required: [true, 'User role is required']
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for user's full credentials
userSchema.virtual('credentials').get(function() {
  return `${this.name} (${this.role})`;
});

// Virtual to get assigned bills
userSchema.virtual('assignedBills', {
  ref: 'PatientBill',
  localField: '_id',
  foreignField: 'createdBy'
});

// Virtual to get assigned expenses
userSchema.virtual('assignedExpenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'incurredBy'
});

// Index for faster queries
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const MonthlySummarySchema = new mongoose.Schema(
  {
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    consultantName: { type: String, required: true },
    monthYear: { type: String, required: true }, // Format: "January 2023"
    Timesheets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Timesheet",
      },
    ],
    totalApprovedAmount: { type: Number, required: true, default: 0 },
    baseSalary: { type: Number, required: true, default: 0 },
    insuranceAmount: { type: Number, required: true, default: 0 },
    expense: { type: Number, required: true, default: 0 }, // Added expense field
    remainingBalance: { type: Number, required: true, default: 0 }, // totalApprovedAmount - baseSalary - insuranceAmount - expense
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partially Paid"],
      default: "Pending",
    },
    paymentDate: { type: Date },
  },
  { timestamps: true }
);
   
// Add compound index to prevent duplicate monthly summaries
MonthlySummarySchema.index({ consultant: 1, monthYear: 1 }, { unique: true });

export default mongoose.models.MonthlySummary ||
  mongoose.model("MonthlySummary", MonthlySummarySchema);
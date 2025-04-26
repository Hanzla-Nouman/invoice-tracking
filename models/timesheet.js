import mongoose from "mongoose";

const TimesheetSchema = new mongoose.Schema({
  consultant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  },
  consultantEmail: { type: String, required: true },
  contract: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Contract", 
    required: true 
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  workType: { 
    type: String, 
    enum: ["Hours", "Days"], 
    required: true 
  },
  workQuantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Paid"], 
    default: "Pending" 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  },
  monthYear: { type: String, required: true }, // Format: "January 2023"
  dateIssued: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });

// Add compound index to prevent duplicate timesheets for same consultant+contract+month
TimesheetSchema.index(
  { consultant: 1, contract: 1, monthYear: 1 }, 
  { unique: true }
);

export default mongoose.models.Timesheet || mongoose.model("Timesheet", TimesheetSchema);
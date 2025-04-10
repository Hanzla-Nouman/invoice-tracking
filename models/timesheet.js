import mongoose from "mongoose";

const TimesheetSchema = new mongoose.Schema({
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  consultantEmail: { type: String, required: true }, 
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  workType: { type: String, enum: ["Hours", "Days"], required: true },
  workQuantity: { type: Number, required: true },
  rate: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  dateIssued: { type: Date, required: true }, 
  notes: { type: String },
}, { timestamps: true });

const Timesheet = mongoose.models.Timesheet || mongoose.model("Timesheet", TimesheetSchema);
export default Timesheet;

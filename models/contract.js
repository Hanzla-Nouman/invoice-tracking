import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true }, // ✅ Ensure this is `customer`
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    paymentTerms: { type: String, enum: ["Upfront", "Milestone", "Recurring"], default: "Milestone" },
    status: { type: String, enum: ["Draft", "Pending Approval", "Active", "Completed", "Terminated"], default: "Draft" }
  },
  { timestamps: true }
);

export default mongoose.models.Contract || mongoose.model("Contract", contractSchema);

import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
  dateIssued: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  deductions: { type: Number, default: 0 },
  finalAmount: { type: Number },
});

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;

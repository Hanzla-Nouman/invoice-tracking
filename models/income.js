import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ["USD", "EUR", "GBP"], required: true },
  paymentMethod: { type: String, enum: ["Credit Card", "Check", "Cash", "E-Transfer"], required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Income || mongoose.model("Income", IncomeSchema);

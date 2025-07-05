import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ["USD", "EUR", "GBP", "INR"], required: true },
  paymentMethod: { type: String, enum: ["Credit Card", "Check", "Cash", "E-Transfer"], required: true },
  date: { type: Date, required: true },
  consultant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users",
    required: true 
  },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
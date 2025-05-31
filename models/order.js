import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" }, // Optional
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

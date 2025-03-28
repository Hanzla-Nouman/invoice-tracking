import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  currency: { type: String, required: true },
  country: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], required: true },
  postalCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);

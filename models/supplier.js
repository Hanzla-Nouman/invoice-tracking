import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);

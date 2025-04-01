import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    title: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    salary: { type: Number, required: true },
    summary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

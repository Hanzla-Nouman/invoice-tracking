import mongoose from "mongoose";

const ConsultantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, default: "Consultant" }, // Role-based access
}, { timestamps: true });

const Consultant = mongoose.models.Consultant || mongoose.model("Consultant", ConsultantSchema);
export default Consultant;

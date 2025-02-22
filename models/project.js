import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  assignedConsultants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Assign consultants
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default Project;

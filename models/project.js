// models/project.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['Draft', 'Started', 'Completed'],
    default: 'Draft'
  },
  budget: {
    type: Number,
    default: 0
  },
  assignedConsultants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }]
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
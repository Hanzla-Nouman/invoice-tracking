"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddProject() {
  const [project, setProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Draft",
    budget: "",
    assignedConsultants: []
  });

  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consultantsLoading, setConsultantsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/consultants")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setConsultants(data);
        setConsultantsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching consultants:", error);
        setConsultantsLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleConsultantToggle = (consultantId) => {
    setProject(prev => {
      const newConsultants = prev.assignedConsultants.includes(consultantId)
        ? prev.assignedConsultants.filter(id => id !== consultantId)
        : [...prev.assignedConsultants, consultantId];
      return { ...prev, assignedConsultants: newConsultants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedData = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        budget: project.budget ? parseFloat(project.budget) : 0
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      if (!res.ok) throw new Error("Failed to add project");

      router.push("/projects");
      toast.success("Project added successfully!");
      setProject({ 
        name: "", 
        description: "", 
        startDate: "", 
        endDate: "",
        status: "Draft",
        budget: "",
        assignedConsultants: [] 
      });
    } catch (err) {
      console.error("Error adding project:", err);
      toast.error("Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Add New Project</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700">Project Name *</label>
          <input
            type="text"
            name="name"
            value={project.name}
            onChange={handleChange}
            placeholder="Customer Portal Redesign"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Status *</label>
          <select
            name="status"
            value={project.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="Draft">Draft</option>
            <option value="Started">Started</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Budget ($)</label>
          <input
            type="number"
            name="budget"
            value={project.budget}
            onChange={handleChange}
            placeholder="25000.00"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={project.startDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            name="endDate"
            value={project.endDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={loading}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={project.description}
            onChange={handleChange}
            placeholder="Redesign of customer portal with modern UI/UX, including new dashboard and reporting features"
            className="w-full p-2 border rounded"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Assign Consultants</label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
            {consultantsLoading ? (
              <p className="text-gray-500">Loading consultants...</p>
            ) : consultants.length > 0 ? (
              consultants.map(consultant => (
                <div key={consultant._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`consultant-${consultant._id}`}
                    checked={project.assignedConsultants.includes(consultant._id)}
                    onChange={() => handleConsultantToggle(consultant._id)}
                    className="h-4 w-4"
                    disabled={loading}
                  />
                  <label htmlFor={`consultant-${consultant._id}`} className="flex-1">
                    {consultant.name} ({consultant.email})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No consultants available</p>
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-1/2 p-3 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
            {loading ? "Adding Project..." : "Add Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
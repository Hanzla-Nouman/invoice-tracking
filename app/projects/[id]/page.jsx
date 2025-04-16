"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Pencil, Trash2, Save, X, Calendar, Users, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Draft",
    budget: "",
    assignedConsultants: []
  });
  const [consultants, setConsultants] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project data
        const projectRes = await fetch(`/api/projects/${id}`);
        if (!projectRes.ok) throw new Error(`HTTP error! Status: ${projectRes.status}`);
        const projectData = await projectRes.json();
        setProject(projectData);
        
        // Format dates for input fields
        const formatDateForInput = (date) => {
          if (!date) return "";
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };
        
        setFormData({
          name: projectData.name,
          description: projectData.description || "",
          startDate: formatDateForInput(projectData.startDate),
          endDate: formatDateForInput(projectData.endDate),
          status: projectData.status || "Draft",
          budget: projectData.budget || "",
          assignedConsultants: projectData.assignedConsultants.map(c => c._id) // Store just the IDs
        });

        // Fetch available consultants
        const consultantsRes = await fetch('/api/consultants');
        if (!consultantsRes.ok) throw new Error('Failed to fetch consultants');
        const consultantsData = await consultantsRes.json();
        setConsultants(consultantsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load project details.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Project deleted successfully!");
      router.push("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      
      // Convert dates and budget to proper format
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        budget: formData.budget ? parseFloat(formData.budget) : 0
      };
      
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const updatedProject = await res.json();
      setProject(updatedProject);
      toast.success("Project updated successfully!");
      router.push("/projects");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Failed to update project.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConsultantToggle = (consultantId) => {
    setFormData(prev => {
      const currentConsultants = prev.assignedConsultants || [];
      const newConsultants = currentConsultants.includes(consultantId)
        ? currentConsultants.filter(id => id !== consultantId)
        : [...currentConsultants, consultantId];
      return { ...prev, assignedConsultants: newConsultants };
    });
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!project) return <p className="text-center">Project not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete "{project.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Project" : "Project Details"}
        </h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Pencil size={16} />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X size={16} />
              Cancel
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Project Name</h3>
              <p className="mt-1 text-xl font-semibold">{project.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</h3>
              <p className={`mt-1 text-lg font-semibold ${
                project.status === "Completed" ? "text-green-600" :
                project.status === "Started" ? "text-blue-600" : "text-gray-600"
              }`}>
                {project.status}
              </p>
            </div>
          </div>
          
          {project.description && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</h3>
              <p className="mt-1 text-gray-700 whitespace-pre-line">{project.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={16} />
                Start Date
              </h3>
              <p className="mt-1 text-lg">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={16} />
                End Date
              </h3>
              <p className="mt-1 text-lg">
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <DollarSign size={16} />
                Budget
              </h3>
              <p className="mt-1 text-lg">
                {project.budget ? `$${project.budget.toLocaleString()}` : "Not specified"}
              </p>
            </div>
          </div>
          
          {project.assignedConsultants?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Users size={16} />
                Assigned Consultants
              </h3>
              <div className="mt-2 space-y-1">
                {project.assignedConsultants.map(consultant => (
                  <div key={consultant._id} className="flex items-center gap-2">
                    <span className="text-gray-700">{consultant.name}</span>
                    <span className="text-gray-500 text-sm">({consultant.email})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="Draft">Draft</option>
                <option value="Started">Started</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Assign Consultants
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
            {consultants.length > 0 ? (
  consultants.map(consultant => (
    <div key={consultant._id} className="flex items-center gap-2">
      <input
        type="checkbox"
        id={`consultant-${consultant._id}`}
        checked={formData.assignedConsultants?.includes(consultant._id)}
        onChange={() => handleConsultantToggle(consultant._id)}
        className="h-4 w-4"
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
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isUpdating ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(project.updatedAt).toLocaleString()}</p>
      </div>
      
    </div>
  );
}
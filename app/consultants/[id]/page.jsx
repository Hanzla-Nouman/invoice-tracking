"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Pencil, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ConsultantDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    yearsOfExperience: "",
    bio: "",
    status: "Active",
    country: "",
    address: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/consultants/${id}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setConsultant(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          yearsOfExperience: data.yearsOfExperience || "",
          bio: data.bio || "",
          status: data.status || "Active",
          country: data.country || "",
          address: data.address || ""
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching consultant:", err);
        setError("Failed to load consultant details.");
        setLoading(false);
      }
    };

    fetchConsultant();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/consultants/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Consultant deleted successfully!");
      router.push("/consultants");
    } catch (err) {
      console.error("Error deleting consultant:", err);
      toast.error("Failed to delete consultant.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/consultants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const updatedConsultant = await res.json();
      setConsultant(updatedConsultant);
      toast.success("Consultant updated successfully!");
      router.push('/consultants')
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating consultant:", err);
      toast.error("Failed to update consultant.");
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!consultant) return <p className="text-center">Consultant not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete {consultant.name}? This action cannot be undone.</p>
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
          {isEditing ? "Edit Consultant" : "Consultant Details"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Name</h3>
              <p className="mt-1 text-lg">{consultant.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email</h3>
              <p className="mt-1 text-lg">{consultant.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</h3>
              <p className={`mt-1 text-lg ${
                consultant.status === "Active" ? "text-green-600" : "text-red-600"
              }`}>
                {consultant.status}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Country</h3>
              <p className="mt-1 text-lg">{consultant.country || "-"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Phone</h3>
              <p className="mt-1 text-lg">{consultant.phone || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Experience</h3>
              <p className="mt-1 text-lg">
                {consultant.yearsOfExperience ? `${consultant.yearsOfExperience} years` : "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Address</h3>
              <p className="mt-1 text-lg">{consultant.address || "-"}</p>
            </div>
          </div>
          
          {consultant.bio && (
            <div className="col-span-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Bio</h3>
              <p className="mt-1 text-gray-700">{consultant.bio}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Name *
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
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              rows={4}
            />
          </div>
          
          <div className="col-span-2 flex justify-end gap-2 pt-4">
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
        <p>Created: {new Date(consultant.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(consultant.updatedAt).toLocaleString()}</p>
      </div>
      
    </div>
  );
}
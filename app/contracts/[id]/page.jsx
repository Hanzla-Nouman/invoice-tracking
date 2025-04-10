"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Pencil, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ContractDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    consultant: "",
    customer: "",
    startDate: "",
    endDate: "",
    rate: 0,
    rateType: "hour",
    paymentTerms: "30 days",
    maxDaysPerYear: null,
    status: "Draft"
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${id}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setContract(data);
        setFormData({
          title: data.title,
          description: data.description,
          consultant: data.consultant?._id || data.consultant,
          customer: data.customer?._id || data.customer,
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDate).toISOString().split('T')[0],
          rate: data.rate,
          rateType: data.rateType,
          paymentTerms: data.paymentTerms,
          status: data.status,
          contractFile: data.contractFile,
          maxDaysPerYear: data.maxDaysPerYear
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError("Failed to load contract details.");
        setLoading(false);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [consultantRes, customerRes] = await Promise.all([
          fetch("/api/consultants"),
          fetch("/api/customers")
        ]);
        
        if (!consultantRes.ok || !customerRes.ok) throw new Error("Failed to fetch dropdown data");
        
        setConsultants(await consultantRes.json());
        setCustomers(await customerRes.json());
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchContract();
    fetchDropdownData();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Contract deleted successfully!");
      router.push("/contracts");
    } catch (err) {
      console.error("Error deleting contract:", err);
      toast.error("Failed to delete contract.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const updatedContract = await res.json();
      setContract(updatedContract);
      toast.success("Contract updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating contract:", err);
      toast.error("Failed to update contract.");
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
  if (!contract) return <p className="text-center">Contract not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete {contract.title}? This action cannot be undone.</p>
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
          {isEditing ? "Edit Contract" : "Contract Details"}
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
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Title</h3>
              <p className="mt-1 text-lg">{contract.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</h3>
              <p className="mt-1 text-lg">{contract.description || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Consultant</h3>
              <p className="mt-1 text-lg">{contract.consultant?.name || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</h3>
              <p className="mt-1 text-lg">{contract.customer?.fullName || "N/A"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</h3>
              <p className={`mt-1 text-lg ${
                contract.status === "Active" ? "text-green-600" :
                contract.status === "Completed" ? "text-blue-600" :
                contract.status === "Terminated" ? "text-red-600" :
                contract.status === "On Hold" ? "text-yellow-600" : "text-gray-600"
              }`}>
                {contract.status}
              </p>
            </div>
            {contract.maxDaysPerYear && (
  <div>
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Max Days/Year</h3>
    <p className="mt-1 text-lg">{contract.maxDaysPerYear}</p>
  </div>
)}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Rate</h3>
              <p className="mt-1 text-lg">
                ${contract.rate} per {contract.rateType}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Terms</h3>
              <p className="mt-1 text-lg">{contract.paymentTerms}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Duration</h3>
              <p className="mt-1 text-lg">
                {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
        
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
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
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Consultant *
              </label>
              <select
                name="consultant"
                value={formData.consultant}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="">Select Consultant</option>
                {consultants.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Customer *
              </label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
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
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div>
  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
    Max Days Per Year
  </label>
  <input
    type="number"
    name="maxDaysPerYear"
    min="0"
    max="366"
    value={formData.maxDaysPerYear || ""}
    onChange={handleChange}
    placeholder="Leave empty for no limit"
    className="w-full p-2 border rounded mt-1"
  />
</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Rate *
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Rate Type *
                </label>
                <select
                  name="rateType"
                  value={formData.rateType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                >
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Payment Terms *
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
            </div>
                    
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
        <p>Created: {new Date(contract.createdAt).toLocaleString()}</p>
        {contract.updatedAt && contract.updatedAt !== contract.createdAt && (
          <p>Last Updated: {new Date(contract.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
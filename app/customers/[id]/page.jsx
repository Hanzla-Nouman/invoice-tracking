"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Pencil, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currency: "usd",
    country: "",
    status: "Active",
    postalCode: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setCustomer(data);
        setFormData({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          currency: data.currency,
          country: data.country,
          status: data.status,
          postalCode: data.postalCode
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Failed to load customer details.");
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      toast.success("Customer deleted successfully!");
      router.push("/customers");
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error("Failed to delete customer.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const updatedCustomer = await res.json();
      setCustomer(updatedCustomer);
      toast.success("Customer updated successfully!");
      router.push("/customers");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating customer:", err);
      toast.error("Failed to update customer.");
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
  if (!customer) return <p className="text-center">Customer not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete {customer.fullName}? This action cannot be undone.</p>
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
          {isEditing ? "Edit Customer" : "Customer Details"}
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
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Name</h3>
              <p className="mt-1 text-lg">{customer.fullName}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email</h3>
              <p className="mt-1 text-lg">{customer.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Phone</h3>
              <p className="mt-1 text-lg">{customer.phone}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</h3>
              <p className={`mt-1 text-lg ${
                customer.status === "Active" ? "text-green-600" : "text-red-600"
              }`}>
                {customer.status}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Country</h3>
              <p className="mt-1 text-lg">{customer.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Currency</h3>
              <p className="mt-1 text-lg">{customer.currency.toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Postal Code</h3>
              <p className="mt-1 text-lg">{customer.postalCode}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
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
                Phone *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="pkr">PKR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
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
        <p>Created: {new Date(customer.createdAt).toLocaleString()}</p>
      </div>
      
   
    </div>
  );
}
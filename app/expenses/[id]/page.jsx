"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Pencil, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ExpenseDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: 0,
    currency: "USD",
    paymentMethod: "Credit Card",
    date: new Date().toISOString().split('T')[0],
    consultant: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/expense/${id}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load expense");
        
        setExpense(data.expense);
        
        // Format date for input field (YYYY-MM-DD)
        const expenseDate = new Date(data.expense.date);
        const formattedDate = expenseDate.toISOString().split('T')[0];
        
        setFormData({
          title: data.expense.title,
          amount: data.expense.amount,
          currency: data.expense.currency,
          paymentMethod: data.expense.paymentMethod,
          date: formattedDate,
          consultant: data.expense.consultant?._id || ""
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching expense:", err);
        setError(err.message || "Failed to load expense details.");
        setLoading(false);
      }
    };

    const fetchConsultants = async () => {
      try {
        const res = await fetch("/api/consultants");
        if (!res.ok) throw new Error("Failed to fetch consultants");
        const data = await res.json();
        setConsultants(data);
      } catch (err) {
        console.error("Error fetching consultants:", err);
      }
    };

    fetchExpense();
    fetchConsultants();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/expense/${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete expense");
      
      toast.success("Expense deleted successfully!");
      router.push("/expenses");
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast.error(err.message || "Failed to delete expense.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      
      // Prepare the data to send
      const updateData = {
        ...formData,
        // Convert date string back to Date object for MongoDB
        date: new Date(formData.date)
      };

      const res = await fetch(`/api/expense/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update expense");
      
      // Update the expense with the returned data
      setExpense(data.expense);
      // Also update formData to match the returned data
      setFormData(prev => ({
        ...prev,
        consultant: data.expense.consultant?._id || ""
      }));
      
      toast.success("Expense updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating expense:", err);
      toast.error(err.message || "Failed to update expense.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!expense) return <p className="text-center">Expense not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete {expense.title}? This action cannot be undone.</p>
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
          {isEditing ? "Edit Expense" : "Expense Details"}
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
              <p className="mt-1 text-lg">{expense.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Consultant</h3>
              <p className="mt-1 text-lg">
                {expense.consultant?.name || "Not assigned"}
                {expense.consultant?.email && (
                  <span className="text-sm text-gray-500 block">{expense.consultant.email}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</h3>
              <p className="mt-1 text-lg">
                {expense.currency} {expense.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Method</h3>
              <p className="mt-1 text-lg">{expense.paymentMethod}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Date</h3>
              <p className="mt-1 text-lg">
                {new Date(expense.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
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
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount}
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
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
                <option value="E-Transfer">E-Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
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
        <p>Created: {new Date(expense.createdAt).toLocaleString()}</p>
        {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
          <p>Last Updated: {new Date(expense.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
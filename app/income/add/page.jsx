"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddIncomePage() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    paymentMethod: "Credit Card",
    date: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (response.ok) {
      toast.success("Income Added!");
      router.push("/income");
    } else {
      toast.error("Failed to add income. Try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Add Income</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Title:</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Salary"
              className="w-full border p-2 rounded mt-1"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Amount:</label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g., 1000"
                className="w-full border p-2 rounded mt-1"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-semibold">Date:</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-semibold">Payment Method:</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                disabled={loading}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="E-Transfer">E-Transfer</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold">Currency:</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                disabled={loading}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/income")}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" /> Adding...
                </>
              ) : (
                "Add Income"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
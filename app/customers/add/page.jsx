"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react"; // For animated loader

export default function AddCustomer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currency: "USD",
    country: "",
    status: "Active",
    postalCode: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    const data = await res.json();

    if (res.ok) {
      toast.success("Customer added successfully!");
      router.push("/customers");
      setForm({ fullName: "", email: "", phone: "", currency: "USD", country: "", status: "Active", postalCode: "" });
    } else {
      toast.error(data.message || "Failed to add customer.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Customer</h1>
      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Full Name:</label>
        <input
          type="text"
          placeholder="John Doe"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Email:</label>
        <input
          type="email"
          placeholder="johndoe@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Phone:</label>
        <input
          type="text"
          placeholder="+1 234 567 8900"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        {/* Country & Currency in same row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mt-2">Country:</label>
            <input
              type="text"
              placeholder="United States"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block font-medium mt-2">Currency:</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
        </div>

        {/* Postal Code & Status in same row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mt-2">Postal Code:</label>
            <input
              type="text"
              placeholder="10001"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block font-medium mt-2">Status:</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
            </>
          ) : (
            "Add Customer"
          )}
        </button>
      </form>
    </div>
  );
}

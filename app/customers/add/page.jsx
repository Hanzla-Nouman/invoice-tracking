"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AddCustomer() {
const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currency: "",
    country: "",
    status: "Active",
    postalCode: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Customer added successfully!");
      router.push('/customers')
      setForm({ fullName: "", email: "", phone: "", currency: "", country: "", status: "Active", postalCode: "" });
    } else {
      toast.error(data.message || "Failed to add customer.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Customer</h1>
      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Full Name:</label>
        <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <label className="block font-medium mt-2">Email:</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <label className="block font-medium mt-2">Phone:</label>
        <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <label className="block font-medium mt-2">Currency:</label>
        <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <label className="block font-medium mt-2">Country:</label>
        <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <label className="block font-medium mt-2">Status:</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border p-2 rounded mt-1">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        
        <label className="block font-medium mt-2">Postal Code:</label>
        <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full border p-2 rounded mt-1" required />
        
        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg">Add Customer</button>
      </form>
    </div>
  );
}

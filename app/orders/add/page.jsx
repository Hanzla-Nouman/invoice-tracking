"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddOrder() {
    const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    customer: "",
    amount: "",
    status: "Pending",
    date: "",
  });

  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) =>{ setCustomers(data)})
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
        toast.success("Order added successfully!");
        router.push('/orders');
      setForm({ title: "", description: "", customer: "", amount: "", status: "Pending", date: "" });
    } else {
        toast.error("Failed to add order!")
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Order</h1>
      {message && <p className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Order Title:</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Description (Optional):</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        />

        <label className="block font-medium mt-2">Customer:</label>
        <select
          value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer._id} className="text-black" value={customer._id}>
              {customer.fullName}
            </option>
          ))}
        </select>

        <label className="block font-medium mt-2">Amount:</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Status:</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <label className="block font-medium mt-2">Date:</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg">
          Add Order
        </button>
      </form>
    </div>
  );
}

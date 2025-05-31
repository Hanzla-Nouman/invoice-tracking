"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

export default function AddOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [order, setOrder] = useState({
    title: "",
    description: "",
    customer: "",
    amount: "",
    status: "Pending",
    date: "",
  });

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setCustomersLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setCustomersLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedData = {
        ...order,
        amount: order.amount ? parseFloat(order.amount) : 0
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      if (!res.ok) throw new Error("Failed to add order");

      router.push("/orders");
      toast.success("Order added successfully!");
      setOrder({ 
        title: "", 
        description: "", 
        customer: "", 
        amount: "", 
        status: "Pending", 
        date: "" 
      });
    } catch (err) {
      console.error("Error adding order:", err);
      toast.error("Failed to add order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-center mb-6">Add New Order</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700">Order Title *</label>
          <input
            type="text"
            name="title"
            value={order.title}
            onChange={handleChange}
            placeholder="Website Development Project"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={order.description}
            onChange={handleChange}
            placeholder="Complete website redesign with e-commerce functionality"
            className="w-full p-2 border rounded"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Customer *</label>
          <select
            name="customer"
            value={order.customer}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading || customersLoading}
          >
            <option value="">Select Customer</option>
            {customersLoading ? (
              <option disabled>Loading customers...</option>
            ) : customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Amount ($) *</label>
          <input
            type="number"
            name="amount"
            value={order.amount}
            onChange={handleChange}
            placeholder="2500.00"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Status *</label>
          <select
            name="status"
            value={order.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Date *</label>
          <input
            type="date"
            name="date"
            value={order.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-1/2 p-3 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
            {loading ? "Adding Order..." : "Add Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
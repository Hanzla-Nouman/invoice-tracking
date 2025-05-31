"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function AddCustomer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    currency: "USD",
    country: "",
    status: "Active",
    postalCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add customer");
      }

      toast.success("Customer added successfully!");
      router.push("/customers");
      setCustomer({ 
        fullName: "", 
        email: "", 
        phone: "", 
        currency: "USD", 
        country: "", 
        status: "Active", 
        postalCode: "" 
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error(error.message || "Failed to add customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Add New Customer</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={customer.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Phone *</label>
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Country *</label>
          <input
            type="text"
            name="country"
            value={customer.country}
            onChange={handleChange}
            placeholder="United States"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Currency *</label>
          <select
            name="currency"
            value={customer.currency}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Postal Code *</label>
          <input
            type="text"
            name="postalCode"
            value={customer.postalCode}
            onChange={handleChange}
            placeholder="10001"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Status *</label>
          <select
            name="status"
            value={customer.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-1/2 p-3 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Adding Customer...
              </>
            ) : "Add Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
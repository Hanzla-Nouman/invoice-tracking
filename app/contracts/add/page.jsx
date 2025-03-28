"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddContractPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    consultant: "",
    customer: "",
    startDate: "",
    endDate: "",
    amount: "",
    paymentTerms: "Milestone",
  });

  const [consultants, setConsultants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [consultantRes, customerRes] = await Promise.all([
          fetch("/api/consultants"),
          fetch("/api/customers"),
        ]);

        if (!consultantRes.ok || !customerRes.ok) throw new Error("Failed to fetch data.");

        setConsultants(await consultantRes.json());
        setCustomers(await customerRes.json());
      } catch (error) {
        console.error("Error loading consultants/customers:", error);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to add contract");

      toast.success("Contract Added!");
      router.push("/contracts");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="flex justify-center">
        <div className="bg-white p-6 max-w-lg w-full shadow-lg rounded-lg border">
          <h1 className="text-2xl font-bold mb-4 text-center">Add Contract</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" type="text" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Title" required />
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Description" />
            <select name="consultant" value={form.consultant} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">Select Consultant</option>
              {consultants.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select name="customer" value={form.customer} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">Select Customer</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="border p-2 rounded" required />
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="border p-2 rounded" required />
            </div>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Amount ($)" />
            <select name="paymentTerms" value={form.paymentTerms} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="Upfront">Upfront</option>
              <option value="Milestone">Milestone</option>
              <option value="Recurring">Recurring</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg">Add Contract</button>
          </form>
        </div>
      </div>
    </div>
  );
}

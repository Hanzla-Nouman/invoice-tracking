"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AddContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        toast.error("Error fetching consultants/customers.");
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to add contract");

      toast.success("Contract added successfully!");
   router.push("/contracts")
    } catch (error) {
      toast.error("Failed to add contarct");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <Toaster />
      <div className="flex justify-center">
        <div className="bg-white p-6 max-w-lg w-full shadow-lg rounded-lg border">
          <h1 className="text-2xl font-bold mb-4 text-center">Add Contract</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block font-medium">Contract Title:</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Software Development Agreement"
              className="w-full border p-2 rounded"
              required
            />

            <label className="block font-medium">Description (Optional):</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Contract for developing a custom web application..."
              className="w-full border p-2 rounded"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Consultant:</label>
                <select
                  name="consultant"
                  value={form.consultant}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Consultant</option>
                  {consultants.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium">Customer:</label>
                <select
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Start Date:</label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block font-medium">End Date:</label>
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Amount ($):</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block font-medium">Payment Terms:</label>
                <select
                  name="paymentTerms"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="Upfront">Upfront</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Recurring">Recurring</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-center text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
               {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
            </>
          ) : (
            "Add Contract"
          )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

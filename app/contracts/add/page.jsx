"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function AddContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [contract, setContract] = useState({
    title: "",
    description: "",
    consultants: [], // Changed from consultant to consultants (array)
    customer: "",
    startDate: "",
    endDate: "",
    rate: "",
    rateType: "hour",
    paymentTerms: "30 days",
    status: "Draft",
    maxDaysPerYear: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [consultantRes, customerRes] = await Promise.all([
          fetch("/api/consultants"),
          fetch("/api/customers"),
        ]);

        if (!consultantRes.ok || !customerRes.ok) {
          throw new Error("Failed to fetch data");
        }

        setConsultants(await consultantRes.json());
        setCustomers(await customerRes.json());
        setDataLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load consultants/customers");
        setDataLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContract(prev => ({ ...prev, [name]: value }));
  };
  const handleConsultantChange = (e) => {
    const options = e.target.options;
    const selectedConsultants = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedConsultants.push(options[i].value);
      }
    }
    setContract(prev => ({ ...prev, consultants: selectedConsultants }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...contract,
        rate: Number(contract.rate),
        startDate: new Date(contract.startDate).toISOString(),
        endDate: new Date(contract.endDate).toISOString(),
        maxDaysPerYear: contract.maxDaysPerYear ? Number(contract.maxDaysPerYear) : null
      };

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add contract");
      }

      toast.success("Contract added successfully!");
      router.push("/contracts");
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error(error.message || "Failed to add contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-center mb-6">Add New Contract</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700">Contract Title *</label>
          <input
            type="text"
            name="title"
            value={contract.title}
            onChange={handleChange}
            placeholder="Software Development Agreement"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Status *</label>
          <select
            name="status"
            value={contract.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Rate Type *</label>
          <select
            name="rateType"
            value={contract.rateType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="hour">Per Hour</option>
            <option value="day">Per Day</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={contract.description}
            onChange={handleChange}
            placeholder="Scope of work, deliverables, and other contract details"
            className="w-full p-2 border rounded"
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
  <label className="block text-gray-700">Consultants *</label>
  <select
    name="consultants"
    multiple
    value={contract.consultants}
    onChange={handleConsultantChange}
    className="w-full p-2 border rounded h-auto min-h-[42px]"
    required
    disabled={loading || dataLoading}
  >
    {dataLoading ? (
      <option disabled>Loading consultants...</option>
    ) : consultants.map((c) => (
      <option key={c._id} value={c._id}>
        {c.name}
      </option>
    ))}
  </select>
  <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
</div>

        <div>
          <label className="block text-gray-700">Customer *</label>
          <select
            name="customer"
            value={contract.customer}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading || dataLoading}
          >
            <option value="">Select Customer</option>
            {dataLoading ? (
              <option disabled>Loading customers...</option>
            ) : customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={contract.startDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">End Date *</label>
          <input
            type="date"
            name="endDate"
            value={contract.endDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Rate ($) *</label>
          <input
            type="number"
            name="rate"
            value={contract.rate}
            onChange={handleChange}
            placeholder="e.g. 75.00"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700">Payment Terms *</label>
          <select
            name="paymentTerms"
            value={contract.paymentTerms}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="15 days">15 days</option>
            <option value="30 days">30 days</option>
            <option value="60 days">60 days</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Max Days Per Year (Optional)</label>
          <input
            type="number"
            name="maxDaysPerYear"
            value={contract.maxDaysPerYear}
            onChange={handleChange}
            placeholder="Leave empty for no limit"
            className="w-full p-2 border rounded"
            min="1"
            max="366"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Maximum working days allowed per year (1-366)</p>
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-1/2 p-3 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
            {loading ? "Adding Contract..." : "Add Contract"}
          </button>
        </div>
      </form>
    </div>
  );
}



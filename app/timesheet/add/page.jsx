"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function AddTimesheet() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    contract: "",
    workType: "Hours",
    workQuantity: "",
    notes: "",
  });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  useEffect(() => {
    if (session?.user?.id) {
      setDataLoading(true);
      fetch(`/api/contracts?consultantId=${session.user.id}`)
        .then(res => res.json())
        .then((data) => {
          setContracts(data?.data || []);
          setDataLoading(false);
        })
        .catch(err => {
          console.error("Error:", err);
          setContracts([]);
          setDataLoading(false);
        });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultant: session.user.id,
          consultantEmail: session.user.email,
          contract: form.contract,
          workType: form.workType,
          workQuantity: form.workQuantity,
          notes: form.notes,
          monthYear: currentMonthYear
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Timesheet submitted successfully!");
        router.push("/timesheet");
      } else {
        setMessage(data.message || "Failed to submit timesheet");
        toast.error(data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      setMessage("Something went wrong. Please try again.");
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedContract = contracts.find(c => c._id === form.contract);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-center mb-2">Add Timesheet</h1>
      <p className="text-lg font-semibold text-center mb-6 text-gray-600">
        {currentMonthYear}
      </p>

      {message && (
        <p className={`mb-4 p-3 rounded ${
          message.includes("success") 
            ? "bg-green-50 text-green-800" 
            : "bg-red-50 text-red-800"
        }`}>
          {message}
        </p>
      )}

      {contracts.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded text-center">
          <p className="text-gray-600">
            {dataLoading ? "Loading contracts..." : "No active contracts assigned to you. Please contact your administrator."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700">Contract *</label>
            <select
              value={form.contract}
              onChange={(e) => setForm({ ...form, contract: e.target.value })}
              className="w-full p-2 border rounded"
              required
              disabled={loading || dataLoading}
            >
              <option value="">Select a Contract</option>
              {contracts.map((contract) => (
                <option key={contract._id} value={contract._id}>
                  {contract.title} - {contract.customer?.fullName || "Unknown Customer"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Work Type *</label>
              <select
                value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                <option value="Hours">Hours</option>
                <option value="Days">Days</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700">
                {form.workType === "Hours" ? "Hours Worked *" : "Days Worked *"}
              </label>
              <input
                type="number"
                min="0"
                step={form.workType === "Hours" ? "0.1" : "1"}
                value={form.workQuantity}
                onChange={(e) => setForm({ ...form, workQuantity: e.target.value })}
                className="w-full p-2 border rounded"
                required
                disabled={loading}
                placeholder={form.workType === "Hours" ? "e.g. 7.5" : "e.g. 1"}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={loading}
              placeholder="Additional information about this timesheet entry"
            />
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="w-1/2 p-3 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
              {loading ? "Submitting..." : "Submit Timesheet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
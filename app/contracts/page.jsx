"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/contracts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
          setContracts(data.reverse());
          setLoading(false);
        })
      .catch((err) => {
          console.error("Error fetching contracts:", err);
          setError("Failed to load contracts.");
        setLoading(false);
      });
  }, []);

  const handleRowClick = (id) => {
    router.push(`/contracts/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">All Contracts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Consultant</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Start</th>
              <th className="p-2 text-left">End</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Max D/Yr</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr 
                key={contract._id} 
                onClick={() => handleRowClick(contract._id)}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-2">{contract.title}</td>
                <td className="p-2">
                  {contract.consultant 
                    ? (typeof contract.consultant === 'object' 
                        ? contract.consultant.name 
                        : "ID: " + contract.consultant)
                    : "No consultant"}
                </td>
                <td className="p-2">{contract?.customer?.fullName || "N/A"}</td>
                <td className="p-2">{new Date(contract.startDate).toLocaleDateString()}</td>
                <td className="p-2">{new Date(contract.endDate).toLocaleDateString()}</td>
                <td className="p-2">${contract.rate} / {contract.rateType}</td>
                <td className="p-2">{contract.maxDaysPerYear || "No limit"}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 text-sm font-semibold rounded-full ${
                      contract.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : contract.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : contract.status === "Terminated"
                        ? "bg-red-100 text-red-700"
                        : contract.status === "On Hold"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
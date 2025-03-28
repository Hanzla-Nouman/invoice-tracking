"use client";

import { useEffect, useState } from "react";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contracts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
          setContracts(data);
          setLoading(false);
        })
      .catch((err) => {
          console.error("Error fetching contracts:", err);
          setError("Failed to load contracts.");
        setLoading(false);
      });
  }, []);

          console.log("contract: ",contracts)
  if (loading) return <p className="text-center text-gray-500 mt-14">Loading contracts...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">All Contracts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Consultant</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract._id} className="border-b">
                <td className="px-4 py-3">{contract.title}</td>
                <td className="px-4 py-3">{contract?.consultant || "N/A"}</td>
                <td className="px-4 py-3">{contract?.customer?.fullName || "N/A"}</td>
                <td className="px-4 py-3">{new Date(contract.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(contract.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">${contract.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded-full ${
                      contract.status === "Pending Approval"
                        ? "bg-yellow-100 text-yellow-700"
                        : contract.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : contract.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
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

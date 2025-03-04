"use client";
import { useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        const data = await res.json();
        setInvoices(data.invoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      {loading ? (
        <p>Loading...</p>
      ) : invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Invoice ID</th>
              <th className="py-2 px-4">Consultant</th>
              <th className="py-2 px-4">Total Amount</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-t">
                <td className="py-2 px-4">{invoice._id}</td>
                <td className="py-2 px-4">{invoice.consultant?.name || "Unknown"}</td>
                <td className="py-2 px-4">${invoice.totalAmount}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded ${invoice.status === "Paid" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

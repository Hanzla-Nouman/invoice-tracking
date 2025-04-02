"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/suppliers")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSuppliers(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching suppliers:", err);
        toast.error("Failed to load suppliers.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Suppliers</h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin w-10 h-10 text-gray-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">Postal Code</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="border-b">
                    <td className="px-4 py-3">{supplier.name}</td>
                    <td className="px-4 py-3">{supplier.email}</td>
                    <td className="px-4 py-3">{supplier.phone || "N/A"}</td>
                    <td className="px-4 py-3">{supplier.country}</td>
                    <td className="px-4 py-3">{supplier.postalCode || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

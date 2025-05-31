"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        setCustomers(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const handleRowClick = (id) => {
    router.push(`/customers/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Customers List</h1>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader className="animate-spin w-10 h-10 text-gray-600" />
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Added On</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr 
                  key={customer._id} 
                  onClick={() => handleRowClick(customer._id)}
                  className="hover:cursor-pointer hover:bg-gray-200"
                >
                  <td className="border p-2">{customer.fullName}</td>
                  <td className="border p-2 text-blue-600 font-semibold">{customer.email}</td>
                  <td className="border p-2">{customer.phone}</td>
                  <td className={`border p-2 font-semibold ${
                    customer.status === "Active" ? "text-green-600" : "text-red-600"
                  }`}>
                    {customer.status}
                  </td>
                  <td className="border p-2 text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
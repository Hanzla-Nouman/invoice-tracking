"use client";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IncomesTable() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/income")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIncomes(data.incomes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching incomes:", err);
        setError("Failed to load incomes.");
        setLoading(false);
      });
  }, []);

  const handleRowClick = (id) => {
    router.push(`/income/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600"  />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Income List</h1>
        <button 
          onClick={() => router.push("/income/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Income
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">Currency</th>
            <th className="border border-gray-300 p-2">Payment Method</th>
            <th className="border border-gray-300 p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income) => (
            <tr 
              key={income._id} 
              onClick={() => handleRowClick(income._id)}
              className="border hover:bg-gray-100 hover:cursor-pointer border-gray-300"
            >
              <td className="p-2 border">{income.title}</td>
              <td className="p-2 border">{income.amount}</td>
              <td className="p-2 border">{income.currency}</td>
              <td className="p-2 border">{income.paymentMethod}</td>
              <td className="p-2 border">
                {new Date(income.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
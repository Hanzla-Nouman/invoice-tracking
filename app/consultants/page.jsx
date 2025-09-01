"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

useEffect(() => {
  const fetchData = async () => {
    try {
      const consultantsRes = await fetch("/api/consultants");
      if (!consultantsRes.ok) throw new Error(`HTTP error! Status: ${consultantsRes.status}`);
      const consultantsData = await consultantsRes.json();
      console.log("📌 Consultants fetched:", consultantsData);

      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      console.log("📌 Current Month-Year being used:", currentMonthYear);

      const consultantsWithBalance = await Promise.all(
        consultantsData.map(async (consultant) => {
          try {
            const summaryRes = await fetch(
              `/api/monthly-summaries?consultantId=${consultant._id}&monthYear=${currentMonthYear}`
            );
            console.log(`📌 Fetching summary for consultant ${consultant._id}:`, summaryRes.status);

            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              console.log(`✅ Summary data for ${consultant._id}:`, summaryData);

              if (Array.isArray(summaryData) && summaryData.length > 0) {
                return {
                  ...consultant,
                  remainingBalance: summaryData[0]?.remainingBalance ?? 0
                };
              }
            }

            console.warn(`⚠️ No summary found for consultant ${consultant._id}`);
            return { ...consultant, remainingBalance: 0 };

          } catch (err) {
            console.error(`❌ Error fetching summary for consultant ${consultant._id}:`, err);
            return { ...consultant, remainingBalance: 0 };
          }
        })
      );

      setConsultants(consultantsWithBalance.reverse());
      setLoading(false);

    } catch (err) {
      console.error("❌ Error fetching consultants:", err);
      setError("Failed to load consultants.");
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleRowClick = (id) => {
    router.push(`/consultants/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Consultants List</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Added On</th>
            <th className="border border-gray-300 p-2">Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          {consultants.map((consultant) => (
            <tr 
              key={consultant._id} 
              onClick={() => handleRowClick(consultant._id)}
              className="border hover:bg-gray-200 hover:cursor-pointer border-gray-500"
            >
              <td className="p-2 border">{consultant.name}</td>
              <td className="p-2 border text-blue-700 font-semibold">{consultant.email}</td>
              <td className={`${consultant.status === "Active" ? "text-green-600" : "text-red-600"} p-2 border`}>
                {consultant.status}
              </td>
              <td className="p-2 border">{new Date(consultant.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">${consultant.remainingBalance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
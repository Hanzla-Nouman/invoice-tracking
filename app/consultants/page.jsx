"use client";

import { useEffect, useState } from "react";

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/consultants")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setConsultants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching consultants:", err);
        setError("Failed to load consultants.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading consultants...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 ">Consultants List</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Added On</th>
          </tr>
        </thead>
        <tbody className="">
          {consultants.map((consultant) => (
            <tr key={consultant._id} className="border  hover:bg-gray-200 hover:cursor-pointer border-gray-500 ">
              <td className="p-2 border">{consultant.name}</td>
              <td className="p-2 border text-blue-700 font-semibold">{consultant.email}</td>
              <td className="p-2 border">{new Date(consultant.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

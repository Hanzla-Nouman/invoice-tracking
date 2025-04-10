"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setLeads(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leads:", err);
        toast.error("Failed to load leads.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Leads</h1>

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
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Added On</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id} className="border-b">
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3">{lead.title}</td>
                    <td className="px-4 py-3 text-blue-700">{lead.email}</td>
                    <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{lead.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No leads found.
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

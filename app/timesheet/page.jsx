"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminTimesheets() {
  const { data: session } = useSession();
  const [timesheets, setTimesheets] = useState([]);
  const [editedTimesheets, setEditedTimesheets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.role === "Admin") {
      fetch(`/api/timesheets?userId=${session.user.id}&role=Admin`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Timesheets Fetched:", data);
          setTimesheets(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching timesheets:", err);
          setError("Failed to load timesheets.");
          setLoading(false);
        });
    }
  }, [session]);

  // ✅ Handle input changes locally before saving
  const handleInputChange = (id, field, value) => {
    setEditedTimesheets((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // ✅ Save changes to the server
  const handleSave = async (id) => {
    try {
      const updatedFields = editedTimesheets[id];
      if (!updatedFields) return;
  
      console.log("Sending Update Request:", updatedFields); // Debugging
  
      const res = await fetch(`/api/timesheets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields), // ✅ Send all updated fields
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Update Response:", data);
  
      if (data) {
        setTimesheets(timesheets.map((t) => (t._id === id ? { ...t, ...data.timesheet } : t)));
        setEditedTimesheets((prev) => {
          const newState = { ...prev };
          delete newState[id]; // Clear saved changes
          return newState;
        });
      }
    } catch (error) {
      console.error("Error updating timesheet:", error.message);
    }
  };
  

  if (loading) return <p className="text-center text-gray-500">Loading timesheets...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Timesheet Management</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Consultant</th>
            <th className="border border-gray-300 p-2">Project</th>
            <th className="border border-gray-300 p-2">Work Type</th>
            <th className="border border-gray-300 p-2">Work Quantity</th>
            <th className="border border-gray-300 p-2">Rate</th>
            <th className="border border-gray-300 p-2">Total Amount</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Payment Status</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((t) => (
            <tr key={t._id} className="border border-gray-300 text-center">
              <td className="p-2">{t.consultant?.name || "Unknown"}</td>
              <td className="p-2">{t.project?.name || "No Project Assigned"}</td>
              <td className="p-2">{t.workType}</td>
              <td className="p-2">{t.workQuantity}</td>
              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-20 text-center"
                  value={editedTimesheets[t._id]?.rate ?? t.rate ?? ""}
                  onChange={(e) => handleInputChange(t._id, "rate", parseFloat(e.target.value) || 0)}
                />
              </td>
              <td className="p-2">${t.totalAmount}</td>
              <td className="p-2">
                <select
                  value={editedTimesheets[t._id]?.status ?? t.status ?? "Pending"}
                  onChange={(e) => handleInputChange(t._id, "status", e.target.value)}
                  className="border p-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
              <td className="p-2">
                <select
                  value={editedTimesheets[t._id]?.paymentStatus ?? t.paymentStatus ?? "Pending"}
                  onChange={(e) => handleInputChange(t._id, "paymentStatus", e.target.value)}
                  className="border p-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </td>
              <td className="p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleSave(t._id)}
                  disabled={!editedTimesheets[t._id]} // Disable if no changes
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

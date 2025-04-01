"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function Timesheet() {
  const { data: session } = useSession();
  const [timesheets, setTimesheets] = useState([]);
  const [editedTimesheets, setEditedTimesheets] = useState({});
  const [editingIds, setEditingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = session?.user?.role;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!role || !userId) return;
    
    const fetchTimesheets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/timesheets?userId=${userId}&role=${role}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTimesheets(data);
      } catch (err) {
        console.error("Error fetching timesheets:", err);
        setError("Failed to load timesheets. Please try again later.");
        toast.error("Failed to load timesheets");
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, [role, userId]);

  const toggleEdit = (id) => {
    if (editingIds.includes(id)) {
      setEditingIds(editingIds.filter(editId => editId !== id));
      setEditedTimesheets(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast("Changes discarded", { icon: "⚠️" });
    } else {
      setEditingIds([...editingIds, id]);
      toast.success("Now in edit mode");
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedTimesheets(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const toastId = toast.loading("Saving changes...");
    try {
      const updatedFields = editedTimesheets[id];
      if (!updatedFields) {
        toast.dismiss(toastId);
        return toast.error("No changes detected");
      }

      const existingTimesheet = timesheets.find(t => t._id === id);
      if (!existingTimesheet) {
        toast.dismiss(toastId);
        return toast.error("Timesheet not found");
      }

      const totalAmount = (updatedFields.workQuantity ?? existingTimesheet.workQuantity) * 
                        (updatedFields.rate ?? existingTimesheet.rate);

      const payload = {
        ...updatedFields,
        totalAmount,
        ...(role === "Consultant" && { status: "Pending" }),
      };

      const res = await fetch(`/api/timesheets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setTimesheets(timesheets.map(t => 
        t._id === id ? { ...t, ...data.timesheet } : t
      ));
      setEditedTimesheets(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setEditingIds(editingIds.filter(editId => editId !== id));
      
      toast.success("Timesheet updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Error updating timesheet:", error.message);
      toast.error(`Save failed: ${error.message}`, { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center text-red-500 p-4 bg-red-50 rounded">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {role === "Admin" ? "Admin Timesheet Management" : "Your Timesheets"}
      </h1>
      
      {timesheets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No timesheets found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {role === "Admin" && <th className="p-3 text-left border-b">Consultant</th>}
                <th className="p-3 text-left border-b">Project</th>
                <th className="p-3 text-left border-b">Work Type</th>
                <th className="p-3 text-left border-b">Work Quantity</th>
                <th className="p-3 text-left border-b">Rate</th>
                <th className="p-3 text-left border-b">Total Amount</th>
                <th className="p-3 text-left border-b">Status</th>
                <th className="p-3 text-left border-b">Payment Status</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  {role === "Admin" && (
                    <td className="p-3">{t.consultant?.name || "Unknown"}</td>
                  )}
                  <td className="p-3">{t.project?.name || "No Project"}</td>
                  <td className="p-3">{t.workType}</td>

                  <td className="p-3">
                    {editingIds.includes(t._id) ? (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-20 p-1 border rounded focus:ring-2 focus:ring-blue-300"
                        value={editedTimesheets[t._id]?.workQuantity ?? t.workQuantity ?? ""}
                        onChange={(e) => 
                          handleInputChange(t._id, "workQuantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      t.workQuantity
                    )}
                  </td>

                  <td className="p-3">
                    {editingIds.includes(t._id) && role === "Admin" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-20 p-1 border rounded focus:ring-2 focus:ring-blue-300"
                        value={editedTimesheets[t._id]?.rate ?? t.rate ?? ""}
                        onChange={(e) => 
                          handleInputChange(t._id, "rate", parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      `$${t.rate?.toFixed(2) || "0.00"}`
                    )}
                  </td>

                  <td className="p-3 font-medium">
  ${(
    ((editedTimesheets[t._id]?.workQuantity ?? t.workQuantity) || 0) * 
    ((editedTimesheets[t._id]?.rate ?? t.rate) || 0)
  ).toFixed(2)}
</td>

                  <td className="p-3">
                    {editingIds.includes(t._id) && role === "Admin" ? (
                      <select
                        className="p-1 border rounded focus:ring-2 focus:ring-blue-300"
                        value={editedTimesheets[t._id]?.status ?? t.status ?? "Pending"}
                        onChange={(e) => handleInputChange(t._id, "status", e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.status === "Approved" ? "bg-green-100 text-green-800" :
                        t.status === "Rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {t.status}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {editingIds.includes(t._id) && role === "Admin" ? (
                      <select
                        className="p-1 border rounded focus:ring-2 focus:ring-blue-300"
                        value={editedTimesheets[t._id]?.paymentStatus ?? t.paymentStatus ?? "Pending"}
                        onChange={(e) => handleInputChange(t._id, "paymentStatus", e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.paymentStatus === "Paid" ? "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {t.paymentStatus}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex space-x-2">
                      {editingIds.includes(t._id) ? (
                        <>
                          <button
                            onClick={() => handleSave(t._id)}
                            disabled={!editedTimesheets[t._id]}
                            className={`px-3 py-1 rounded text-white ${
                              editedTimesheets[t._id] 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => toggleEdit(t._id)}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => toggleEdit(t._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
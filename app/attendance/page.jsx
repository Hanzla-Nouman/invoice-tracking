"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

export default function AttendanceList() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ status: "", notes: "" });

  useEffect(() => {
    fetchDates();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchAttendance();
  }, [selectedDate]);

  const fetchDates = async () => {
    try {
      setLoadingDates(true);
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setDates(data);
      if (data.length > 0) setSelectedDate(data[0]);
    } catch (error) {
      toast.error("Failed to load dates");
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      toast.error("Failed to load attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setEditData({ status: record.status, notes: record.notes || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ status: "", notes: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    try {
      setSavingEdit(true);
      const res = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          attendanceId: editingId,
          ...editData 
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Attendance updated");
        fetchAttendance();
        cancelEdit();
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-4">
      <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>
      
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Date</label>
        {loadingDates ? (
          <div className="flex items-center text-gray-500">
            <Loader className="animate-spin mr-2" size={18} />
            Loading available dates...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1 rounded transition ${
                  selectedDate === date 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {new Date(date).toLocaleDateString()}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="border rounded overflow-hidden shadow-sm">
          <div className="p-3 bg-gray-100 border-b">
            <h2 className="font-semibold">
              Attendance for {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>
          
          {loadingAttendance ? (
            <div className="p-6 text-center flex items-center justify-center text-gray-500">
              <Loader className="animate-spin mr-2" size={20} />
              Loading attendance records...
            </div>
          ) : attendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map(record => (
                  <tr key={record._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.employee?.name}</div>
                        </div>
                      </div>
                    </td>
                    
                    {editingId === record._id ? (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            name="status"
                            value={editData.status}
                            onChange={handleEditChange}
                            className="border p-1 rounded text-sm"
                          >
                            {["Present", "Absent", "Late", "Half-Day"].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            name="notes"
                            value={editData.notes}
                            onChange={handleEditChange}
                            className="border p-1 rounded w-full text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-900 mr-4"
                            disabled={savingEdit}
                          >
                            {savingEdit ? (
                              <Loader className="animate-spin inline mr-1" size={16} />
                            ) : null}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === "Present" ? "bg-green-100 text-green-800" :
                            record.status === "Absent" ? "bg-red-100 text-red-800" :
                            record.status === "Late" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.notes || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => startEdit(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No attendance records found for this date
            </div>
          )}
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MarkAttendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
      
      // Initialize all as Present
      const defaultAttendance = {};
      data.forEach(emp => {
        defaultAttendance[emp._id] = "Present";
      });
      setAttendance(defaultAttendance);
    } catch (error) {
      toast.error("Failed to load employees");
    }
  };

  const handleStatusChange = (empId, status) => {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceRecords = employees.map(emp => ({
        employee: emp._id,
        status: attendance[emp._id] || "Absent"
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, attendanceRecords })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Attendance marked successfully");
        router.push("/attendance");
      } else {
        throw new Error(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>
      
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Attendance Date</label>
        <DatePicker
          selected={date}
          onChange={date => setDate(date)}
          className="border p-2 rounded w-full"
          maxDate={new Date()}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Employee</th>
                <th className="p-3">Present</th>
                <th className="p-3">Absent</th>
                <th className="p-3">Late</th>
                <th className="p-3">Half-Day</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id} className="border-b">
                  <td className="p-3">{emp.name}</td>
                  {["Present", "Absent", "Late", "Half-Day"].map(status => (
                    <td key={status} className="p-3 text-center">
                      <input
                        type="radio"
                        name={`attendance-${emp._id}`}
                        checked={attendance[emp._id] === status}
                        onChange={() => handleStatusChange(emp._id, status)}
                        className="h-4 w-4"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Attendance"}
        </button>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function MarkAttendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        // Default all employees to "Present"
        const defaultAttendance = {};
        data.forEach((emp) => {
          defaultAttendance[emp._id] = "Present";
        });
        setAttendance(defaultAttendance);
      })
      .catch(() => toast.error("Failed to fetch employees"));
  }, []);

  const handleChange = (empId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [empId]: status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const attendanceRecords = employees.map((emp) => ({
      employee: emp._id,
      date: new Date().toISOString(),
      status: attendance[emp._id] || "Absent",
    }));

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceRecords }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Attendance marked successfully!");
      router.push("/attendance");
    } else {
      toast.error(data.message || "Failed to mark attendance.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Mark Attendance</h1>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-b">
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`attendance-${emp._id}`}
                        value="Present"
                        checked={attendance[emp._id] === "Present"}
                        onChange={() => handleChange(emp._id, "Present")}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`attendance-${emp._id}`}
                        value="Absent"
                        checked={attendance[emp._id] === "Absent"}
                        onChange={() => handleChange(emp._id, "Absent")}
                        className="w-5 h-5"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <button type="submit" className="w-1/3 p-2 bg-blue-500 text-white rounded" disabled={loading}>
            {loading ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </form>
    </div>
  );
}

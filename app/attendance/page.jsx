"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

export default function AttendanceList() {
  const [dates, setDates] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data) => {
        setDates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dates:", err);
        toast.error("Failed to load attendance dates.");
        setLoading(false);
      });
  }, []);

  const fetchAttendance = (date) => {
    setLoading(true);
    setSelectedDate(date);
    fetch(`/api/attendance?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setAttendances(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        toast.error("Failed to load attendance records.");
        setLoading(false);
      });
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Attendance Records</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Select Date:</h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-gray-600" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {dates.length > 0 ? (
              dates.map((date) => (
                <button
                  key={date}
                  onClick={() => fetchAttendance(date)}
                  className={`px-4 py-2 border rounded-md ${
                    selectedDate === date ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {new Date(date).toLocaleDateString()}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No attendance records found.</p>
            )}
          </div>
        )}
      </div>

      {selectedDate && (
        <>
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Attendance on {new Date(selectedDate).toLocaleDateString()}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin w-10 h-10 text-gray-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length > 0 ? (
                    attendances.map((attendance) => (
                      <tr key={attendance._id} className="border-b">
                        <td className="px-4 py-3">{attendance.employee.name}</td>
                        <td className={`${attendance.status === "Present" ? 'text-green-600':'text-red-600'}  px-4 py-3`}>{attendance.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-4 text-gray-500">
                        No attendance records found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

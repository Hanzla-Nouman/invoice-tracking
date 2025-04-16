"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

export default function AddTimesheet() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    project: "",
    workType: "Hours",
    workQuantity: "",
    notes: "",
  });

  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Fetch assigned projects
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/projects?consultant=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setProjects(data))
        .catch((err) => console.error("Error fetching projects:", err));
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
  
    if (!session?.user) {
      setMessage("You must be logged in to submit a timesheet.");
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultant: session.user.id,
          project: form.project,
          consultantEmail: session.user.email,
          workType: form.workType,
          workQuantity: form.workQuantity,
          notes: form.notes
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success("Monthly timesheet submitted successfully!");
        router.push("/timesheet");
      } else {
        setMessage(data.message || "Failed to submit timesheet.");
        setCanSubmit(false); // Disable form if duplicate timesheet exists
        toast.error(data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      setMessage("Something went wrong. Please try again.");
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Add Timesheet</h1>
      <p className="text-lg font-semibold mb-4 text-gray-600">
        {currentMonthYear}
      </p>

      {message && (
        <p className={`mb-4 p-3 rounded ${
          message.includes("success") 
            ? "bg-green-50 text-green-800" 
            : "bg-red-50 text-red-800"
        }`}>
          {message}
          {!canSubmit && (
            <button
              onClick={() => router.push("/timesheet")}
              className="mt-2 block text-blue-600 hover:underline"
            >
              View your existing timesheet
            </button>
          )}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-gray-600">
            No projects assigned to you. Please contact your administrator.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Project:</label>
            <select
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="w-full p-2 border rounded"
              required
              disabled={!canSubmit}
            >
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Work Type:</label>
            <select
              value={form.workType}
              onChange={(e) => setForm({ 
                ...form, 
                workType: e.target.value,
                workQuantity: ""
              })}
              className="w-full p-2 border rounded"
              disabled={!canSubmit}
            >
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {form.workType === "Hours" ? "Hours Worked:" : "Days Worked:"}
            </label>
            <input
              type="number"
              min="0"
              step={form.workType === "Hours" ? "0.1" : "1"}
              value={form.workQuantity}
              onChange={(e) => setForm({ 
                ...form, 
                workQuantity: e.target.value 
              })}
              className="w-full p-2 border rounded"
              required
              disabled={!canSubmit}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Notes (Optional):</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={!canSubmit}
            />
          </div>

          <button
            type="submit"
            className={`w-full p-2 rounded text-white flex items-center justify-center ${
              !canSubmit
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Submitting...
              </>
            ) : (
              canSubmit ? "Submit Timesheet" : "Already Submitted"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddTimesheet() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    project: "",
    workType: "Hours",
    workQuantity: "",
    dateIssued: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch only assigned projects for the logged-in consultant
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

    if (!session?.user) {
      setMessage("You must be logged in to submit a timesheet.");
      return;
    }

    const res = await fetch("/api/timesheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultant: session.user.id,
        consultantEmail: session.user.email,
        dateIssued: new Date().toISOString().split("T")[0],
        ...form,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Timesheet submitted successfully!")
       router.push("/timesheet")
    } else {
      setMessage(data.message || "Failed to submit timesheet.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Timesheet</h1>
      {message && <p className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Project:</label>
        <select
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        >
          <option value="">Select a Project</option>
          {projects.length > 0 ? (
            projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))
          ) : (
            <option disabled>No assigned projects</option>
          )}
        </select>

        <label className="block font-medium mt-2">Work Type:</label>
        <select
          value={form.workType}
          onChange={(e) => setForm({ ...form, workType: e.target.value, workQuantity: "" })}
          className="w-full border p-2 rounded mt-1"
        >
          <option value="Hours">Hours</option>
          <option value="Days">Days</option>
        </select>

        <label className="block font-medium mt-3">{form.workType === "Hours" ? "Hours Worked:" : "Days Worked:"}</label>
        <input
          type="number"
          value={form.workQuantity}
          onChange={(e) => setForm({ ...form, workQuantity: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-3">Notes (Optional):</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        />

        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg">
          Submit Timesheet
        </button>
      </form>
    </div>
  );
}

"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddProject() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    assignedConsultant: "",
  });

  const [consultants, setConsultants] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultantsLoading, setConsultantsLoading] = useState(true);
const router = useRouter();

  useEffect(() => {
    fetch("/api/consultants")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setConsultants(data);
        setConsultantsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching consultants:", error);
        setConsultantsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/projects")
      toast.success("Project added successfully!");
      setForm({ name: "", description: "", startDate: "", endDate: "", assignedConsultant: "" });
    } else {
      toast.success("Failed to add project.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Project</h1>
      {message && <p className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Project Name:</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
          disabled={loading}
        />

        <label className="block font-medium mt-2">Description:</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block font-medium">Start Date:</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border p-2 rounded mt-1"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block font-medium">End Date:</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full border p-2 rounded mt-1"
              disabled={loading}
            />
          </div>
        </div>

        <label className="block font-medium mt-2">Assign Consultant:</label>
        <select
          value={form.assignedConsultant}
          onChange={(e) => setForm({ ...form, assignedConsultant: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          disabled={loading || consultantsLoading}
        >
          <option value="" disabled>
            {consultantsLoading ? "Loading consultants..." : "Select a consultant"}
          </option>
          {consultants.map((consultant) => (
            <option key={consultant._id} value={consultant._id}>
              {consultant.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
            </>
          ) : (
            "Add Project"
          )}
        </button>
      </form>
    </div>
  );
}

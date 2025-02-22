"use client";

import { useState, useEffect } from "react";

export default function AddProject() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    assignedConsultants: [],
  });

  const [consultants, setConsultants] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch consultants from the backend
  useEffect(() => {
    fetch("/api/consultants")
      .then((res) => {
        console.log("Response Status:", res.status);
        console.log("Response Headers:", res.headers.get("content-type"));
  
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
  
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        setConsultants(data);
      })
      .catch((error) => {
        console.error("Error fetching consultants:", error);
      });
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (res.ok) {
      setMessage("Project added successfully!");
      setForm({ name: "", description: "", startDate: "", endDate: "", assignedConsultants: [] });
    } else {
      setMessage(data.message || "Failed to add project.");
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
        />

        <label className="block font-medium mt-2">Description:</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        />
<div className="flex justify-between">
<div className="flex-col flex">
        <label className="block font-medium mt-2">Start Date:</label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        />
        </div>
<div className="flex-col flex">
        <label className="block font-medium mt-2">End Date:</label>
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="w-full border p-2 rounded mt-1"
        />
        </div>
</div>
        <label className="block font-medium mt-2">Assign Consultants:</label>
        <select
          multiple
          value={form.assignedConsultants}
          onChange={(e) =>
            setForm({ ...form, assignedConsultants: [...e.target.selectedOptions].map((o) => o.value) })
          }
          className="w-full border p-2 rounded mt-1"
        >
          {consultants.map((consultant) => (
            <option key={consultant._id} value={consultant._id}>
              {consultant.name}
            </option>
          ))}
        </select>

        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg">
          Add Project
        </button>
      </form>
    </div>
  );
}

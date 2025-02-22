"use client";

import { useState } from "react";

export default function AddConsultant() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/consultants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (res.ok) {
      setMessage("Consultant added successfully!");
      setForm({ name: "", email: "", password: "" });
    } else {
      setMessage(data.message || "Failed to add consultant.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add Consultant</h1>
      {message && <p className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Name:</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Email:</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Password:</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded mt-1"
          required
        />

        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg">
          Add Consultant
        </button>
      </form>
    </div>
  );
}

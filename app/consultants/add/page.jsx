"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AddConsultant() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/consultants');
        toast.success("Consultant added successfully!");
        setForm({ name: "", email: "", password: "" });
      } else {
        toast.error(data.message || "Failed to add consultant.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Add Consultant</h1>

      <form onSubmit={handleSubmit}>
        <label className="block font-medium">Full Name:</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="John Doe"
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Email Address:</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="john.doe@example.com"
          className="w-full border p-2 rounded mt-1"
          required
        />

        <label className="block font-medium mt-2">Password:</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Minimum 8 characters"
          className="w-full border p-2 rounded mt-1"
          required
        />

        <button
          type="submit"
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
           {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
            </>
          ) : (
            "Add Consultant"
          )}
        </button>
      </form>
    </div>
  );
}

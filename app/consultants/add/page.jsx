"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AddConsultant() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    phone: "",
    yearsOfExperience: "",
    bio: "",
    status: "Active",
    country: "",
    address: "",
    ratePerHour: "",
    ratePerDay: "",
    baseSalary: "",
    insuranceAmount: "",
  });
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if financial fields are empty
    if (
      form.baseSalary === "" || 
      form.insuranceAmount === "" || 
      form.ratePerHour === "" || 
      form.ratePerDay === ""
    ) {
      toast.error("Please enter values for all financial fields (you may enter 0 if applicable)");
      return;
    }

    setLoading(true);

    try {
      // Convert financial fields to numbers
      const payload = {
        ...form,
        baseSalary: Number(form.baseSalary),
        insuranceAmount: Number(form.insuranceAmount),
        ratePerHour: Number(form.ratePerHour),
        ratePerDay: Number(form.ratePerDay)
      };

      const res = await fetch("/api/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/consultants');
        toast.success("Consultant added successfully!");
        setForm({ 
          name: "", 
          email: "", 
          password: "",
          phone: "",
          yearsOfExperience: "",
          bio: "",
          status: "Active",
          country: "",
          address: "",
          ratePerHour: "",
          ratePerDay: "",
          baseSalary: "",
          insuranceAmount: "",
        });
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
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Add Consultant</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700">Full Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Password *</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 234 567 8901"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Years of Experience</label>
          <input
            type="number"
            name="yearsOfExperience"
            value={form.yearsOfExperience}
            onChange={handleChange}
            placeholder="5"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Base Salary ($) *</label>
          <input
            type="number"
            name="baseSalary"
            value={form.baseSalary}
            onChange={handleChange}
            placeholder="3000"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Insurance Amount ($) *</label>
          <input
            type="number"
            name="insuranceAmount"
            value={form.insuranceAmount}
            onChange={handleChange}
            placeholder="500"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Rate Per Hour ($) *</label>
          <input
            type="number"
            name="ratePerHour"
            value={form.ratePerHour}
            onChange={handleChange}
            placeholder="50"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Rate Per Day ($) *</label>
          <input
            type="number"
            name="ratePerDay"
            value={form.ratePerDay}
            onChange={handleChange}
            placeholder="400"
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="United States"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Main St"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Bio/Description</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Brief description of experience and skills..."
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-1/2 p-2 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? (
              <Loader className="animate-spin h-5 w-5 mr-2" />
            ) : (
              "Add Consultant"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
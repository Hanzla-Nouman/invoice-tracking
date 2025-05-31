"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddEmployee() {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    country: "",
    city: "",
    salary: "",
    summary: "",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/employees");
      toast.success("Employee added successfully!");
      setEmployee({ name: "", email: "", phone: "", title: "", country: "", city: "", salary: "", summary: "" });
    } else {
      toast.error(data.message || "Failed to add employee.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Add Employee</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        
        {/* Name */}
        <div>
          <label className="block text-gray-700">Name</label>
          <input type="text" name="name" required placeholder="John Doe" className="w-full p-2 border rounded" onChange={handleChange} value={employee.name} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700">Email</label>
          <input type="email" name="email" required placeholder="johndoe@example.com" className="w-full p-2 border rounded" onChange={handleChange} value={employee.email} />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700">Phone</label>
          <input type="text" name="phone" placeholder="+1 234 567 8901" className="w-full p-2 border rounded" onChange={handleChange} value={employee.phone} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-700">Title</label>
          <input type="text" name="title" required placeholder="Software Engineer" className="w-full p-2 border rounded" onChange={handleChange} value={employee.title} />
        </div>

        {/* Country */}
        <div>
          <label className="block text-gray-700">Country</label>
          <input type="text" name="country" required placeholder="United States" className="w-full p-2 border rounded" onChange={handleChange} value={employee.country} />
        </div>

        {/* City */}
        <div>
          <label className="block text-gray-700">City</label>
          <input type="text" name="city" required placeholder="New York" className="w-full p-2 border rounded" onChange={handleChange} value={employee.city} />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-gray-700">Salary</label>
          <input type="number" name="salary" required placeholder="50000" className="w-full p-2 border rounded" onChange={handleChange} value={employee.salary} />
        </div>

        {/* Summary */}
        <div className="col-span-2">
          <label className="block text-gray-700">Summary (Optional)</label>
          <textarea name="summary" placeholder="Brief description about the employee" className="w-full p-2 border rounded" onChange={handleChange} value={employee.summary}></textarea>
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-center">
          <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white rounded flex items-center justify-center">
            {loading ? <Loader className="animate-spin" size={20} /> : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

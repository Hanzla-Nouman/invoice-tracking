"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateLead() {
  const [lead, setLead] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    country: "",
    postalCode: "",
    description: "",
    source: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLead({ ...lead, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
        router.push('/leads')
      toast.success("Lead created successfully!");
      setLead({ name: "", title: "", email: "", phone: "", country: "", postalCode: "", description: "", source: "" });
    } else {
      toast.error(data.message || "Failed to create lead.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Create Lead</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input type="text" name="name" required placeholder="John Doe" className="w-full p-2 border rounded" onChange={handleChange} value={lead.name} />
        </div>

        <div>
          <label className="block text-gray-700">Title</label>
          <input type="text" name="title" required placeholder="Software Engineer" className="w-full p-2 border rounded" onChange={handleChange} value={lead.title} />
        </div>

        <div>
          <label className="block text-gray-700">Email</label>
          <input type="email" name="email" required placeholder="johndoe@example.com" className="w-full p-2 border rounded" onChange={handleChange} value={lead.email} />
        </div>

        <div>
          <label className="block text-gray-700">Phone (Optional)</label>
          <input type="text" name="phone" placeholder="+1 234 567 8901" className="w-full p-2 border rounded" onChange={handleChange} value={lead.phone} />
        </div>

        <div>
          <label className="block text-gray-700">Country</label>
          <input type="text" name="country" required placeholder="United States" className="w-full p-2 border rounded" onChange={handleChange} value={lead.country} />
        </div>

        <div>
          <label className="block text-gray-700">Postal Code (Optional)</label>
          <input type="text" name="postalCode" placeholder="10001" className="w-full p-2 border rounded" onChange={handleChange} value={lead.postalCode} />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Description (Optional)</label>
          <textarea name="description" placeholder="Interested in our services for mobile app development." className="w-full p-2 border rounded" onChange={handleChange} value={lead.description}></textarea>
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Source</label>
          <select name="source" required className="w-full p-2 border rounded" onChange={handleChange} value={lead.source}>
            <option value="">Select Source</option>
            <option value="Facebook">Facebook</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Referral">Referral</option>
            <option value="Website">Website</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="col-span-2 flex justify-center">
          <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white rounded flex items-center justify-center">
            {loading ? <Loader className="animate-spin" size={20} /> : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

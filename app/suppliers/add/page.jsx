"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateSupplier() {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    postalCode: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplier),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/suppliers");
      toast.success("Supplier added successfully!");
      setSupplier({ name: "", email: "", phone: "", country: "", postalCode: "" });
    } else {
      toast.error(data.message || "Failed to add supplier.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Add Supplier</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input type="text" name="name" required placeholder="Supplier Name" className="w-full p-2 border rounded" onChange={handleChange} value={supplier.name} />
        </div>

        <div>
          <label className="block text-gray-700">Email</label>
          <input type="email" name="email" required placeholder="supplier@example.com" className="w-full p-2 border rounded" onChange={handleChange} value={supplier.email} />
        </div>

        <div>
          <label className="block text-gray-700">Phone (Optional)</label>
          <input type="text" name="phone" placeholder="+1 234 567 8901" className="w-full p-2 border rounded" onChange={handleChange} value={supplier.phone} />
        </div>

        <div>
          <label className="block text-gray-700">Country</label>
          <input type="text" name="country" required placeholder="Country" className="w-full p-2 border rounded" onChange={handleChange} value={supplier.country} />
        </div>

        <div>
          <label className="block text-gray-700">Postal Code (Optional)</label>
          <input type="text" name="postalCode" placeholder="10001" className="w-full p-2 border rounded" onChange={handleChange} value={supplier.postalCode} />
        </div>

        <div className="col-span-2 flex justify-center">
          <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white rounded flex items-center justify-center">
            {loading ? <Loader className="animate-spin" size={20} /> : "Add Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}

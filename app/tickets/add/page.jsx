"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
export default function CreateTicket() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
  const [ticket, setTicket] = useState({
    title: "",
    message: "",
    priority: "",
  });
  console.log(session)

  const [consultantId, setConsultantId] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchConsultant() {

        if (userId) {
        console.log(" here: ",userId)
        setConsultantId(userId);
      }else{
        console.log("No id")
      }
    }
    fetchConsultant();
  }, []);

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ticket, consultant: consultantId }), // Ensure consultantId is included
    });
  
    const data = await res.json();
    setLoading(false);
  
    if (res.ok) {
      router.push("/tickets");
      toast.success("Ticket created successfully!");
      setTicket({ title: "", message: "", priority: "" });
    } else {
      toast.error(data.message || "Failed to create ticket.");
    }
  };

  
    

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Create Ticket</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700">Title</label>
          <input type="text" name="title" required placeholder="Issue with service" className="w-full p-2 border rounded" onChange={handleChange} value={ticket.title} />
        </div>

        <div>
          <label className="block text-gray-700">Message</label>
          <textarea name="message" required placeholder="Describe your issue..." className="w-full p-2 border rounded" onChange={handleChange} value={ticket.message}></textarea>
        </div>

        <div>
          <label className="block text-gray-700">Priority</label>
          <select name="priority" required className="w-full p-2 border rounded" onChange={handleChange} value={ticket.priority}>
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="mt-4 flex justify-center">
          <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white rounded flex items-center justify-center">
            {loading ? <Loader className="animate-spin" size={20} /> : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

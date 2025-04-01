"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    const fetchTickets = async () => {
      try {
 
        
     
        const res = await fetch(`/api/tickets?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch tickets");
        
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        toast.error("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Tickets</h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin w-10 h-10 text-gray-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created On</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b">
                    <td className="px-4 py-3">{ticket.title}</td>
                    <td className="px-4 py-3">{ticket.status}</td>
                    <td className="px-4 py-3">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function AddExpensePage() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    paymentMethod: "Credit Card",
    date: "",
    consultant: ""
  });
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consultantsLoading, setConsultantsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/consultants")
      .then(res => res.json())
      .then(data => {
        setConsultants(data);
        setConsultantsLoading(false);
      })
      .catch(err => {
        console.error("Error loading consultants:", err);
        setConsultantsLoading(false);
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.consultant) {
      toast.error("Please select a consultant");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (response.ok) {
      toast.success("Expense Added!");
      router.push("/expenses");
      setForm({ 
        title: "", 
        amount: "", 
        currency: "USD", 
        paymentMethod: "Credit Card", 
        date: "",
        consultant: ""
      });
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to add expense. Try again.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="flex justify-center items-center">
        <div className="bg-white p-6 max-w-lg w-full shadow-lg rounded-lg border">
          <h1 className="text-2xl font-bold mb-4 text-black text-center">Add Expense</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold">Consultant:</label>
              {consultantsLoading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <select
                  name="consultant"
                  value={form.consultant}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  required
                  disabled={loading}
                >
                  <option value="">Select Consultant</option>
                  {consultants.map(consultant => (
                    <option key={consultant._id} value={consultant._id}>
                      {consultant.name} ({consultant.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold">Title:</label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Office Rent"
                className="w-full border p-2 rounded mt-1"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Amount:</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="w-full border p-2 rounded mt-1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold">Date:</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  required
                  disabled={loading}
                />
              </div>


        
            </div>
              <div>
                <label className="block font-semibold">Payment Method:</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  disabled={loading}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="E-Transfer">E-Transfer</option>
                </select>
              </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center" 
              disabled={loading || consultantsLoading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" /> Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
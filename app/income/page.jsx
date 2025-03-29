"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IncomePage() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    paymentMethod: "Credit Card",
    date: "",
  });

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showAll, setShowAll] = useState(false);
const router = useRouter();

  useEffect(() => {
    fetch("/api/income")
      .then((res) => res.json())
      .then((data) => setIncomes(data.incomes))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (response.ok) {
      toast.success("Income Added!");
router.push('/')
      setForm({ title: "", amount: "", currency: "USD", paymentMethod: "Credit Card", date: "" });

      const res = await fetch("/api/income");
      const updatedIncomes = await res.json();
      setIncomes(updatedIncomes.incomes);
    } else {
      toast.error("Failed to add income. Try again.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="flex justify-center items-center">
        <div className="bg-white p-6 max-w-lg w-full shadow-lg rounded-lg border">
          <h1 className="text-2xl font-bold mb-4 text-black text-center">Add Income</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Title:</label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Salary"
                className="w-full border p-2 rounded mt-1"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Amount:</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className="w-full border p-2 rounded mt-1"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-medium">Date:</label>
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
              <div>
                <label className="block font-medium">Payment Method:</label>
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
              <div>
                <label className="block font-medium">Currency:</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  disabled={loading}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                </>
              ) : (
                "Add Income"
              )}
            </button>
          </form>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-6">Recent Incomes</h2>
      {fetching ? (
        <div className="flex justify-center mt-4"><Loader className="animate-spin h-6 w-6" /></div>
      ) : (
        <ul className="bg-white p-4 rounded-lg shadow mt-4">
          {(showAll ? incomes : incomes.slice(0, 10)).map((income) => (
            <li key={income._id} className="border-b p-2">
              {income.title} - ${income.amount} ({income.currency}) [{income.paymentMethod}]
            </li>
          ))}
          {incomes.length > 10 && (
            <button onClick={() => setShowAll(!showAll)} className="mt-2 w-full text-blue-600 underline">
              {showAll ? "Show Less" : "Show All"}
            </button>
          )}
        </ul>
      )}
    </div>
  );
}

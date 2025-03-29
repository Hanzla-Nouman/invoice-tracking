"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpensePage() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    paymentMethod: "Credit Card",
    date: "",
  });
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/expense")
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses);
        setExpensesLoading(false);
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (response.ok) {
      toast.success("Expense Added!");
      router.push("/");
      setForm({ title: "", amount: "", currency: "USD", paymentMethod: "Credit Card", date: "" });

      setExpensesLoading(true);
      const res = await fetch("/api/expense");
      const updatedExpenses = await res.json();
      setExpenses(updatedExpenses.expenses);
      setExpensesLoading(false);
    } else {
      toast.error("Failed to add expense. Try again.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="flex justify-center items-center">
        <div className="bg-white p-6 max-w-lg w-full shadow-lg rounded-lg border">
          <h1 className="text-2xl font-bold mb-4 text-black text-center">Add Expense</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Title:</label>
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
                <label className="block font-medium">Amount:</label>
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
                  <Loader className="animate-spin h-5 w-5 mr-2" /> Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </button>
          </form>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-6">Recent Expenses</h2>
      {expensesLoading ? (
        <div className="text-center py-4">
          <Loader className="animate-spin h-6 w-6 mx-auto" />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          {expenses.slice(0, showAll ? expenses.length : 10).map((expense) => (
            <div key={expense._id} className="border-b p-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{expense.title}</p>
                <p className="text-gray-600">{expense.paymentMethod} | {expense.currency} {expense.amount}</p>
              </div>
              <span className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</span>
            </div>
          ))}
          {expenses.length > 10 && (
            <button
              className="mt-4 text-blue-600 underline w-full text-center"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function IncomePage() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    paymentMethod: "Credit Card",
    date: "",
  });

  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    fetch("/api/income")
      .then((res) => res.json())
      .then((data) => setIncomes(data.incomes));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      toast.success("Income Added!");
      setForm({ title: "", amount: "", currency: "USD", paymentMethod: "Credit Card", date: "" });

      // Fetch updated incomes list from the backend
      const res = await fetch("/api/income");
      const updatedIncomes = await res.json();
      setIncomes(updatedIncomes.incomes); // Update state with latest data
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6">
      {/* Centered Form */}
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
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block font-medium">Amount:</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-medium">Date:</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-medium">Payment Method:</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="E-Transfer">E-Transfer</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block font-medium">Currency:</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full mt-4 bg-green-600 text-white p-2 rounded-lg">
              Add Income
            </button>
          </form>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-6">Recent Incomes</h2>
      <ul className="bg-white p-4 rounded-lg shadow mt-4">
        {incomes?.map((income) => (
          <li key={income._id} className="border-b p-2">
            {income.title} - ${income.amount} ({income.currency}) [{income.paymentMethod}]
          </li>
        ))}
      </ul>
    </div>
  );
}
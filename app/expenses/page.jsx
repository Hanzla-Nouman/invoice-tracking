"use client";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpensesTable({ role = "User" }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consultantFilter, setConsultantFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [consultantNameFilter, setConsultantNameFilter] = useState("");
  const router = useRouter();
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
  useEffect(() => {
    Promise.all([
      fetch("/api/expense").then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      }),
    ])
    .then(([expenseData,]) => {
      setExpenses(expenseData.expenses);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      setError("Failed to load data.");
      setLoading(false);
    });
  }, []);

  const handleRowClick = (id) => {
    router.push(`/expenses/${id}`);
  };

  // Get available months from expenses
  const availableMonths = [...new Set(
    expenses.map(expense => {
      const date = new Date(expense.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })
  )].sort((a, b) => new Date(b) - new Date(a));

  // Get unique consultant names from expenses
  const availableConsultantNames = [...new Set(
    expenses.map(expense => expense.consultant?.name).filter(Boolean)
  )].sort();

  // Filter expenses based on selected filters
  const filteredExpenses = expenses.filter(expense => {
    // Consultant ID filter
    const matchesConsultant = !consultantFilter || 
      (expense.consultant && expense.consultant._id === consultantFilter) ||
      (consultantFilter === "unassigned" && !expense.consultant);
    
    // Month filter
    const matchesMonth = !monthFilter || 
      new Date(expense.date).toISOString().startsWith(monthFilter);
    
    // Consultant name filter (case insensitive partial match)
    const matchesName = !consultantNameFilter ||
      (expense.consultant?.name && 
       expense.consultant.name.toLowerCase().includes(consultantNameFilter.toLowerCase()));
    
    return matchesConsultant && matchesMonth && matchesName;
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expenses List</h1>
        <button 
          onClick={() => router.push("/expenses/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Expense
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-4">
  

        {/* Month filter */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Months</option>
          {availableMonths.map((month) => {
            const [year, monthNum] = month.split('-');
            const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });
            return (
              <option key={month} value={month}>
                {monthName} {year}
              </option>
            );
          })}
        </select>

        {/* New Consultant Name filter */}
        <select
          value={consultantNameFilter}
          onChange={(e) => setConsultantNameFilter(e.target.value)}
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Consultants</option>
          {availableConsultantNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {(monthFilter || consultantFilter || consultantNameFilter) && (
          <button
            onClick={() => {
              setMonthFilter("");
              setConsultantFilter("");
              setConsultantNameFilter("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Consultant</th>
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">Payment Method</th>
            <th className="border border-gray-300 p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <tr 
                key={expense._id} 
                onClick={() => handleRowClick(expense._id)}
                className="border hover:bg-gray-100 hover:cursor-pointer border-gray-300"
              >
                <td className="p-2 border">
                  {expense.consultant?.name || "Unassigned"}
                </td>
                <td className="p-2 border">{expense.title}</td>
                <td className="p-2 border">${expense.amount.toFixed(2)}</td>
                <td className="p-2 border">{expense.paymentMethod}</td>
                <td className="p-2 border">
                  {formatDate(expense.date)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No expenses found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
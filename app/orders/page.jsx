"use client";

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOrders(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return   <div className="flex justify-center py-20">
  <Loader className="animate-spin w-10 h-10 text-gray-600" />
</div>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-4 md:mt-10 p-4 md:p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          All Orders
        </h1>
        <button
          onClick={() => router.push("/orders/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus /> Add Order
        </button>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Title
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Budget
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Date
              </th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-200 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => router.push(`/orders/${order._id}`)}
                >
                  <td className="px-4 py-3 text-gray-700">{order.title}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {order?.customer?.fullName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">
                    ${order.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition"
              onClick={() => router.push(`/orders/${order._id}`)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">{order.title}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {order?.customer?.fullName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Budget:</span> $
                  {order.amount.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {order.date
                    ? new Date(order.date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-14">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        All Orders
      </h1>
      
      <div className="overflow-x-auto">
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
                >
                  <td className="px-4 py-3 text-gray-700">{order.title}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {order?.customer?.fullName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">${order.amount}</td>
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
    </div>
  );
}

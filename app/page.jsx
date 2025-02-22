"use client";

import { useState } from "react";

export default function ReviewTimesheets() {
  const dummyTimesheets = [
    { _id: "1", consultant: { name: "John Doe" }, project: { name: "Project A" }, workType: "Hours", workQuantity: 8, rate: 50, totalAmount: 400, status: "Pending", paymentStatus: "Pending" },
    { _id: "2", consultant: { name: "Alice Smith" }, project: { name: "Project B" }, workType: "Days", workQuantity: 3, rate: 200, totalAmount: 600, status: "Approved", paymentStatus: "Paid" },
    { _id: "3", consultant: { name: "Bob Johnson" }, project: { name: "Project C" }, workType: "Hours", workQuantity: 5, rate: 60, totalAmount: 300, status: "Rejected", paymentStatus: "Pending" },
  ];

  const [timesheets, setTimesheets] = useState(dummyTimesheets);

  // Function to update rate and dynamically update total amount
  const updateRate = (id, newRate) => {
    setTimesheets(timesheets.map((t) =>
      t._id === id
        ? { ...t, rate: newRate, totalAmount: newRate * t.workQuantity }
        : t
    ));
  };

  // Function to approve and confirm rate
  const handleApproval = (id, status) => {
    setTimesheets(timesheets.map((t) =>
      t._id === id ? { ...t, status, paymentStatus: "Pending" } : t
    ));
  };

  // Function to update payment status
  const updatePaymentStatus = (id, paymentStatus) => {
    setTimesheets(timesheets.map((t) =>
      t._id === id ? { ...t, paymentStatus } : t
    ));
  };

  return (
    <div className="">
    <div className="mt-3  ">
      <h1 className="text-2xl font-bold">Review Timesheets</h1>
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Consultant</th>
            <th className="p-2">Project</th>
            <th className="p-2">Hours</th>
            <th className="p-2">Days</th>
            <th className="p-2">Rate</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((t) => (
            <tr key={t._id} className="border text-center">
              <td className="p-2">24-Jan-2025</td>
              <td className="p-2">{t.consultant.name}</td>
              <td className="p-2">{t.project.name}</td>
              <td className="p-2">{t.workType === "Hours" ? t.workQuantity : "-"}</td>
              <td className="p-2">{t.workType === "Days" ? t.workQuantity : "-"}</td>
              <td className="p-2">
                {t.status === "Pending" ? (
                  <input
                    type="number"
                    className="border p-1 w-20"
                    value={t.rate}
                    onChange={(e) => updateRate(t._id, parseFloat(e.target.value) || 0)}
                  />
                ) : (
                  `$${t.rate}`
                )}
              </td>
              <td className="p-2">${t.totalAmount.toFixed(2)}</td>
              <td className={`p-2 ${t.paymentStatus === "Paid" ? "text-green-600" : t.paymentStatus === "Overdue" ? "text-red-600" : "text-yellow-600"}`}>
                {t.paymentStatus}
              </td>
              <td className="p-2">
                {t.status === "Pending" && (
                  <button
                    onClick={() => handleApproval(t._id, "Approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Approve
                  </button>
                )}
                {t.status === "Approved" && (
                  <>
                    <button
                      onClick={() => updatePaymentStatus(t._id, "Paid")}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(t._id, "Overdue")}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                    Overdue
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

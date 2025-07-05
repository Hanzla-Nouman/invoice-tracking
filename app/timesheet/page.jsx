"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { MdCancel } from "react-icons/md";
import { FaEdit, FaSave } from "react-icons/fa";

export default function Timesheet() {
  const { data: session } = useSession();
  const [timesheets, setTimesheets] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [editedTimesheets, setEditedTimesheets] = useState({});
  const [editingIds, setEditingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentStatusValue, setPaymentStatusValue] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [consultantFilter, setConsultantFilter] = useState("");

  const role = session?.user?.role;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!role || !userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch consultants if admin
        if (role === "Admin") {
          const consultantsRes = await fetch("/api/consultants");
          if (consultantsRes.ok) {
            const consultantsData = await consultantsRes.json();
            setConsultants(consultantsData);
          }
        }

        // Fetch timesheets
        const timesheetsRes = await fetch(
          `/api/timesheets?userId=${userId}&role=${role}`
        );

        if (!timesheetsRes.ok) throw new Error(`HTTP ${timesheetsRes.status}`);

        const timesheetsData = await timesheetsRes.json();
        const sortedTimesheets = timesheetsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTimesheets(sortedTimesheets);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, userId]);

  const fetchMonthlySummaries = async () => {
    setLoading(true);
    try {
      // Include consultantId in the request if user is a consultant
      const url = role === "Consultant" 
        ? `/api/monthly-summaries?consultantId=${userId}`
        : '/api/monthly-summaries';
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch summaries');
      
      const data = await response.json();
      setMonthlyData(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load monthly summaries');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (role && userId) {
      fetchMonthlySummaries();
    }
  }, [role, userId, showSummary]);

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((t) => {
    
      const monthYear = t.monthYear || 
        new Date(t.dateIssued).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      
      const monthMatch = !monthFilter || monthYear === monthFilter;
      
      const consultantMatch = !consultantFilter || 
        role !== "Admin" || 
        t.consultant?._id === consultantFilter;
      
      return monthMatch && consultantMatch;
    });
  }, [timesheets, monthFilter, consultantFilter, role]);

  const availableMonths = useMemo(() => {
    const months = new Set();
    timesheets.forEach((t) => {
      const monthYear = t.monthYear || 
        new Date(t.dateIssued).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      months.add(monthYear);
    });
    return Array.from(months).sort((a, b) => {
      // Sort months chronologically
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });
  }, [timesheets]);

  const toggleSummaryView = () => {
    setShowSummary(!showSummary);
  };

  const toggleEdit = (id) => {
    if (editingIds.includes(id)) {
      setEditingIds(editingIds.filter((editId) => editId !== id));
      setEditedTimesheets((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast("Changes discarded", { icon: "⚠️" });
    } else {
      setEditingIds([...editingIds, id]);
      toast.success("Now in edit mode");
    }
  };

  const togglePaymentEdit = (month) => {
    if (editingPaymentId === month._id) {
      setEditingPaymentId(null);
      setPaymentStatusValue("");
    } else {
      setEditingPaymentId(month._id);
      setPaymentStatusValue(month.paymentStatus);
    }
  };

  const handlePaymentStatusChange = async (month) => {
    if (!paymentStatusValue) return;
    
    const toastId = toast.loading("Updating payment status...");
    try {
      const res = await fetch(`/api/monthly-summaries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: month._id,
          paymentStatus: paymentStatusValue
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updatedSummary = await res.json();
      
      setMonthlyData(prev => prev.map(m => 
        m._id === month._id ? { 
          ...m, 
          paymentStatus: updatedSummary.paymentStatus,
          paymentDate: updatedSummary.paymentDate 
        } : m
      ));
      
      toast.success("Payment status updated!", { id: toastId });
      setEditingPaymentId(null);
    
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(`Failed to update: ${error.message}`, { id: toastId });
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedTimesheets((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const toastId = toast.loading("Saving changes...");
    try {
      const updatedFields = editedTimesheets[id];
      if (!updatedFields) {
        toast.dismiss(toastId);
        return toast.error("No changes detected");
      }

      const existingTimesheet = timesheets.find((t) => t._id === id);
      if (!existingTimesheet) {
        toast.dismiss(toastId);
        return toast.error("Timesheet not found");
      }

      const workQuantity =
        updatedFields.workQuantity ?? existingTimesheet.workQuantity;
      const rate = updatedFields.rate ?? existingTimesheet.rate;
      const totalAmount = workQuantity * rate;

      const payload = {
        ...updatedFields,
        totalAmount,
        ...(role === "Consultant" && { status: "Pending" }),
        paymentStatus: updatedFields.paymentStatus ?? existingTimesheet.paymentStatus
      };

      const res = await fetch(`/api/timesheets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setTimesheets(
        timesheets.map((t) => (t._id === id ? { ...t, ...data.timesheet } : t))
      );
      setEditedTimesheets((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setEditingIds(editingIds.filter((editId) => editId !== id));

      toast.success("Timesheet updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Error updating timesheet:", error.message);
      toast.error(`Save failed: ${error.message}`, { id: toastId });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin w-10 h-10 text-gray-600" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {role === "Admin" ? "Admin Timesheet Management" : "Your Timesheets"}
      </h1>

      {monthlyData.filter(month => 
        month.Timesheets?.some(t => t.status === "Approved") || 
        month.approvedTimesheetsCount > 0
      ).length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={toggleSummaryView}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showSummary ? "Show Detailed View" : "Show Monthly Summary"}
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {role === "Admin" && !showSummary && (
          <select
            value={consultantFilter}
            onChange={(e) => setConsultantFilter(e.target.value)}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All Consultants</option>
            {consultants.map((consultant) => (
              <option key={consultant._id} value={consultant._id}>
                {consultant.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Months</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        {(monthFilter || consultantFilter) && (
          <button
            onClick={() => {
              setMonthFilter("");
              setConsultantFilter("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      {showSummary ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {role === "Admin" && (
                  <th className="p-1 text-left border-b">Consultant</th>
                )}
                <th className="text-left p-1 border-b">Month</th>
                <th className="text-left p-1 border-b">App. Ts</th>
                <th className="text-left p-1 border-b">Insurance</th>
                <th className="text-left p-1 border-b">Salary</th>
                <th className="text-left p-1 border-b">Total</th>
                <th className="text-left p-1 border-b">Remaining</th>
                <th className="text-left p-1 border-b">Payment</th>
                <th className="text-left p-1 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.length === 0 ? (
                <tr>
                  <td colSpan={role === "Admin" ? 9 : 8} className="text-center py-4">
                    No monthly data found
                  </td>
                </tr>
              ) : (
                monthlyData.map((month) => {
                  const paymentDate = month.paymentDate 
                    ? new Date(month.paymentDate).toLocaleDateString()
                    : 'N/A';
                  
                  return (
                    <tr 
                      key={month._id} 
                      className={`border-b hover:bg-gray-50`}
                    >
                      {role === "Admin" && (
                        <td className="p-1 font-semibold">
                          {month.consultantName}
                        </td>
                      )}
                      <td className="p-1 font-semibold">
                        {month.monthYear}
                      </td>
                      <td className="p-1">
                        {month.Timesheets?.filter(timesheet => timesheet.status === "Approved").length || 0}
                      </td>
                      
                      <td className="p-1">€ {month.insuranceAmount?.toFixed(2) || '0.00'}</td>
                      <td className="p-1">€ {month.baseSalary?.toFixed(2) || '0.00'}</td>
                      <td className="p-1">€ {month.totalApprovedAmount?.toFixed(2) || '0.00'}</td>
                      <td className="p-1">€ {month.remainingBalance?.toFixed(2) || '0.00'}</td>
                      
                      <td className="p-1">
                      {editingPaymentId === month._id && role === "Admin" ? (
                        <select
                          value={paymentStatusValue}
                          onChange={(e) => setPaymentStatusValue(e.target.value)}
                          className="p-1 border rounded focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Partially Paid">Partially Paid</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            month.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : month.paymentStatus === "Partially Paid"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {month.paymentStatus}
                        </span>
                      )}
                      </td>
                      
                      <td className="p-1">
                        {role === "Admin" && (
                          <div className="flex space-x-2">
                            {editingPaymentId === month._id ? (
                              <>
                                <button
                                  onClick={() => handlePaymentStatusChange(month)}
                                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  <FaSave size={20} />
                                </button>
                                <button
                                  onClick={() => togglePaymentEdit(month)}
                                  className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  <MdCancel size={20} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => togglePaymentEdit(month)}
                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                <FaEdit size={20} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">
                {timesheets.length === 0 
                  ? "No timesheets found" 
                  : "No timesheets match your current filters"}
              </p>
              {(monthFilter || consultantFilter) && (
                <button
                  onClick={() => {
                    setMonthFilter("");
                    setConsultantFilter("");
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {role === "Admin" && (
                      <th className="p-1 text-left border-b">Consultant</th>
                    )}
                    <th className="p-1 text-left border-b">Month</th>
                    <th className="p-1 text-left border-b">Contract</th>
                    <th className="p-1 text-left border-b">Type</th>
                    <th className="p-1 text-left border-b">Qty</th>
                    <th className="p-1 text-left border-b">Rate</th>
                    <th className="p-1 text-left border-b">Total</th>
                    <th className="p-1 text-left border-b">Admin Fee</th>
                    <th className="p-1 text-left border-b">Remaining</th>
                    <th className="p-1 text-left border-b">Status</th>
                    <th className="p-1 text-left border-b">Payment</th>
                    <th className="p-1 text-left border-b">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTimesheets.map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      {role === "Admin" && (
                        <td className="p-1 text-blue-600">
                          {t.consultant?.name.split(" ")[0] || "Unknown"}
                        </td>
                      )}
                      <td className="p-1">
                        {t.monthYear ||
                          new Date(t.dateIssued).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                      </td>
                      <td className="p-1">
                        {t.contract?.title.split(" ")[0] || "No Contract"}
                      </td>
                      <td className="p-1">{t.workType}</td>

                      <td className="p-1">
                        {editingIds.includes(t._id) ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-20 p-1 border rounded focus:ring-2 focus:ring-blue-300"
                            value={
                              editedTimesheets[t._id]?.workQuantity ??
                              t.workQuantity ??
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                t._id,
                                "workQuantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        ) : (
                          t.workQuantity
                        )}
                      </td>

                      <td className="p-1">
                        {editingIds.includes(t._id) && role === "Admin" ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 p-1 border rounded focus:ring-2 focus:ring-blue-300"
                            value={editedTimesheets[t._id]?.rate ?? t.rate ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                t._id,
                                "rate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        ) : (
                          `€ ${t.rate || "0.00"}`
                        )}
                      </td>

                      <td className="p-1 font-bold">
                        €
                        {(
                          ((editedTimesheets[t._id]?.workQuantity ??
                            t.workQuantity) ||
                            0) * ((editedTimesheets[t._id]?.rate ?? t.rate) || 0)
                        ).toFixed(2)}
                      </td>

                      <td className="p-1">
                        {t.contract?.adminFee ? `${t.contract.adminFee}%` : '0%'}
                      </td>

                      <td className="p-1 font-bold">
                        €
                        {(
                          ((editedTimesheets[t._id]?.workQuantity ?? t.workQuantity) || 0) * 
                          ((editedTimesheets[t._id]?.rate ?? t.rate) || 0) * 
                          (1 - (t.contract?.adminFee || 0) / 100)
                        ).toFixed(2)}
                      </td>

                      <td className="p-1">
                        {editingIds.includes(t._id) && role === "Admin" ? (
                          <select
                            className="p-1 border rounded focus:ring-2 focus:ring-blue-300"
                            value={
                              editedTimesheets[t._id]?.status ??
                              t.status ??
                              "Pending"
                            }
                            onChange={(e) =>
                              handleInputChange(t._id, "status", e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              t.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : t.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {t.status}
                          </span>
                        )}
                      </td>

                      <td className="p-1">
                        {editingIds.includes(t._id) && role === "Admin" ? (
                          <select
                            className="p-1 border rounded focus:ring-2 focus:ring-blue-300"
                            value={
                              editedTimesheets[t._id]?.paymentStatus ??
                              t.paymentStatus ??
                              "Pending"
                            }
                            onChange={(e) =>
                              handleInputChange(t._id, "paymentStatus", e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              t.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : t.paymentStatus === "Partially Paid"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {t.paymentStatus}
                          </span>
                        )}
                      </td>

                      <td className="p-1">
                        <div className="flex space-x-2">
                          {editingIds.includes(t._id) ? (
                            <>
                              <button
                                onClick={() => handleSave(t._id)}
                                disabled={!editedTimesheets[t._id]}
                                className={`p-1 rounded text-white ${
                                  editedTimesheets[t._id]
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-300 cursor-not-allowed"
                                }`}
                              >
                                <FaSave size={20} />
                              </button>
                              <button
                                onClick={() => toggleEdit(t._id)}
                                className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                <MdCancel size={20} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleEdit(t._id)}
                              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              <FaEdit size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateInvoice() {
  const [timesheets, setTimesheets] = useState([]);
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTimesheets() {
      try {
        const res = await fetch('/api/timesheets?status=Approved');
        const data = await res.json();
        setTimesheets(data);
      } catch (error) {
        console.error('Error fetching timesheets:', error);
      }
    }
    fetchTimesheets();
  }, []);

  const handleSelect = (id) => {
    setSelectedTimesheets((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleGenerateInvoice = async () => {
    if (selectedTimesheets.length === 0) {
      alert("Please select at least one timesheet!");
      return;
    }
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timesheetIds: selectedTimesheets }),
      });
      if (!res.ok) throw new Error("Failed to generate invoice");
  
      alert("Invoice generated successfully!");
      
      // Refresh timesheets after invoice creation
      const updatedRes = await fetch("/api/timesheets?status=Approved");
      const updatedData = await updatedRes.json();
      setTimesheets(updatedData);
      
      setSelectedTimesheets([]); // Reset selection
      router.refresh();
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };
  

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Generate Invoice</h1>
      <div className='border p-4 rounded-lg'>
        {timesheets?.length === 0 ? (
          <p>No approved timesheets available.</p>
        ) : (
          <ul>
            {timesheets.map((ts) => (
              <li key={ts._id} className='flex justify-between items-center py-2'>
                <span>
                  {ts.consultantEmail} - {ts.workType}: {ts.workQuantity} x {ts.rate} = ${ts.totalAmount}
                </span>
                <input
                  type='checkbox'
                  checked={selectedTimesheets.includes(ts._id)}
                  onChange={() => handleSelect(ts._id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        onClick={handleGenerateInvoice}
      >
        Generate Invoice
      </button>
    </div>
  );
}

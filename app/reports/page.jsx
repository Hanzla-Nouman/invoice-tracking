"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Reports() {
  const [loading, setLoading] = useState(null);

  const handleExport = async (type) => {
    setLoading(type);
    try {
      const response = await fetch(`/api/reports/${type}`);
      
      if (!response.ok) throw new Error("Failed to download report");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Export Reports</h1>
      <div className="grid gap-4">
        {[
          "income", 
          "expenses", 
          "employees", 
        ].map((type) => (
          <button
            key={type}
            onClick={() => handleExport(type)}
            className="w-full p-2 bg-blue-500 text-white rounded flex items-center justify-center"
          >
            {loading === type ? <Loader className="animate-spin" size={20} /> : `Export ${type.charAt(0).toUpperCase() + type.slice(1)} Report`}
          </button>
        ))}
      </div>
    </div>
  );
}

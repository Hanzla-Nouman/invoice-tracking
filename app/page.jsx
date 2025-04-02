"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import { useSession } from "next-auth/react";
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [consultants, setConsultants] = useState(0);
  const [projects, setProjects] = useState(0);
  const [timesheets, setTimesheets] = useState([]);
  const [incomeConsultant, setIncomeConsultant] = useState(0);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [consultantMonthlyData, setConsultantMonthlyData] = useState([]);

  const { data: session } = useSession();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const router = useRouter();

  const getCurrentMonthIncome = (timesheets) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();

    return timesheets
      .filter((timesheet) => {
        const sheetDate = new Date(timesheet.dateIssued);
        return (
          sheetDate.getMonth() === currentMonth &&
          sheetDate.getFullYear() === currentYear
        );
      })
      .reduce((total, timesheet) => total + timesheet.totalAmount, 0);
  };

  useEffect(() => {
    if (!role || !userId || role != "Consultant") return;

    let isMounted = true;

    const fetchTimesheets = async () => {
      try {
        const res = await fetch(
          `/api/timesheets?userId=${userId}&role=${role}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) setTimesheets(data);
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching timesheets:", err);
          setError("Failed to load timesheets. Please try again later.");
          toast.error("Failed to load timesheets");
        }
      }
    };

    fetchTimesheets();
    return () => {
      isMounted = false;
    };
  }, [role, userId]);

  useEffect(() => {
    if (timesheets.length > 0) {
      const income = getCurrentMonthIncome(timesheets);
      setCurrentMonthIncome(income);
      
      // Calculate monthly income data for the last 6 months
      const currentDate = new Date();
      const monthlyData = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Get data for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthIncome = timesheets
          .filter(timesheet => {
            const sheetDate = new Date(timesheet.dateIssued);
            return sheetDate.getMonth() === month && sheetDate.getFullYear() === year;
          })
          .reduce((sum, timesheet) => sum + timesheet.totalAmount, 0);
        
        monthlyData.push({
          month: `${monthNames[month]} ${year}`,
          income: monthIncome
        });
      }
      
      setConsultantMonthlyData(monthlyData);
    }
  }, [timesheets]);

  useEffect(() => {
    if (timesheets.length > 0) {
      const paidIncome = timesheets.reduce((sum, timesheet) => {
        return timesheet.paymentStatus === "Paid"
          ? sum + timesheet.totalAmount
          : sum;
      }, 0);
      setIncomeConsultant(paidIncome);
    }
  }, [timesheets]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();

        if (json.success) {
          setCustomers(json.customers);
          setConsultants(json.consultants);
          setProjects(json.projects);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const incomeRes = await fetch("/api/income");
        const expenseRes = await fetch("/api/expense");

        const incomeJson = await incomeRes.json();
        const expenseJson = await expenseRes.json();

        if (incomeJson.success) {
          setIncomeData(incomeJson.incomes);
          calculateTotals(incomeJson.incomes, "income");
        }

        if (expenseJson.success) {
          setExpenseData(expenseJson.expenses);
          calculateTotals(expenseJson.expenses, "expense");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  function calculateTotals(data, type) {
    const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
    const currentYear = new Date().getFullYear(); // Get current year

    let total = 0;
    let monthlyTotal = 0;

    data.forEach((item) => {
      total += item.amount;

      const itemDate = new Date(item.date);
      if (
        itemDate.getMonth() + 1 === currentMonth &&
        itemDate.getFullYear() === currentYear
      ) {
        monthlyTotal += item.amount;
      }
    });

    if (type === "income") {
      setTotalIncome(total);
      setMonthlyIncome(monthlyTotal);
    } else {
      setTotalExpense(total);
      setMonthlyExpense(monthlyTotal);
    }
  }

  const adminChartData = {
    labels: [
      "Apr 2024",
      "May 2024",
      "Jun 2024",
      "Jul 2024",
      "Aug 2024",
      "Sep 2024",
      "Oct 2024",
      "Nov 2024",
      "Dec 2024",
      "Jan 2025",
      "Feb 2025",
      "Mar 2025",
    ],
    datasets: [
      {
        label: "Income",
        data: incomeData.map((item) => item.amount),
        borderColor: "#374151",
        backgroundColor: "rgba(55, 65, 81, 0.2)",
        fill: true,
      },
      {
        label: "Expenses",
        data: expenseData.map((item) => item.amount),
        borderColor: "#E11D48",
        backgroundColor: "rgba(225, 29, 72, 0.2)",
        fill: true,
      },
    ],
  };

  const consultantChart = {
    labels: consultantMonthlyData.map(item => item.month),
    datasets: [
      {
        label: "Your Monthly Income",
        data: consultantMonthlyData.map(item => item.income),
        borderColor: "#374151",
        backgroundColor: "rgba(55, 65, 81, 0.2)",
        fill: true,
      }
    ],
  };

  return (
    <div className="min-h-screen p-6 mt-4">
      <div className="p-2 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
    
      <div className={`grid grid-cols-1 md:grid-cols-2 p-2 rounded ${role === "Admin"? 'lg:grid-cols-4':'lg:grid-cols-2'} gap-3 mt-6`}>
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow">
          <h2 className="text-base font-semibold">
            Total Income{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-bar-chart-fill"
              viewBox="0 0 16 16"
            >
              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"></path>
            </svg>
          </h2>

          <p className="text-2xl font-bold">
            ${" "}
            <CountUp
              duration={4}
              end={role === "Admin" ? totalIncome : incomeConsultant}
            />
          </p>
        </div>
       {role === "Admin" && <div className="bg-gray-900 text-white p-4 rounded-lg shadow">
          <h2 className="text-base font-semibold">
            Total Expense
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-down-right-square-fill"
              viewBox="0 0 16 16"
            >
              <path d="M14 16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12zM5.904 5.197 10 9.293V6.525a.5.5 0 0 1 1 0V10.5a.5.5 0 0 1-.5.5H6.525a.5.5 0 0 1 0-1h2.768L5.197 5.904a.5.5 0 0 1 .707-.707z"></path>
            </svg>
          </h2>
          <p className="text-2xl font-bold">
            $ <CountUp duration={3} end={totalExpense} />
          </p>
        </div>}
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow">
          <h2 className="text-base font-semibold">
            Monthly Income
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#fff"
              className="bi bi-arrow-left-square-fill"
              viewBox="0 0 16 16"
            >
              <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1z"></path>
            </svg>
          </h2>
          <p className="text-2xl font-bold">
            ${" "}
            <CountUp
              duration={5}
              end={role === "Admin" ? monthlyIncome : currentMonthIncome}
            />{" "}
          </p>
        </div>
    {role==="Admin" &&    <div className="bg-gray-900 text-white p-4 rounded-lg shadow">
          <h2 className="text-base font-semibold">
            Monthly Expense
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-right-square-fill"
              viewBox="0 0 16 16"
            >
              <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1z"></path>
            </svg>
          </h2>
          <p className="text-2xl font-bold">
            $ <CountUp duration={2} end={monthlyExpense} />{" "}
          </p>
        </div>}
      </div>

      {role === "Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div
            onClick={() => router.push("/customers")}
            className="bg-white hover:cursor-pointer hover:-translate-y-1 transition-all duration-100  hover:text-gray-900  p-6 rounded-lg shadow text-center"
          >
            <h2 className="text-lg font-semibold">Customers</h2>
            <p className="text-2xl font-bold">{customers}</p>
          </div>
          <div
            onClick={() => router.push("/consultants")}
            className="bg-white hover:cursor-pointer hover:-translate-y-1 transition-all duration-100 hover:text-gray-900 p-6 rounded-lg shadow text-center"
          >
            <h2 className="text-lg font-semibold">Consultants</h2>
            <p className="text-2xl font-bold">{consultants}</p>
          </div>
          <div
            onClick={() => router.push("/projects")}
            className="bg-white hover:cursor-pointer hover:-translate-y-1 transition-all duration-100 hover:text-gray-900 p-6 rounded-lg shadow text-center"
          >
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="text-2xl font-bold">{projects}</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {role === "Admin" ? "Financial Overview" : "Your Monthly Income"}
        </h2>
        <div className="w-full h-80">
          <Line 
            data={role === "Admin" ? adminChartData : consultantChart} 
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import { useMemo,useState } from "react";
import {  useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AiFillCustomerService } from "react-icons/ai";
import { GoSignIn } from "react-icons/go";
import { MdAccountBalance, MdContactSupport, MdManageAccounts, MdSpaceDashboard } from "react-icons/md";
import { FaAngleDown, FaAngleUp, FaRegCalendarAlt, FaSellsy, FaProjectDiagram, FaFileContract } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiCube } from "react-icons/hi";
import { IoDocuments } from "react-icons/io5";
const Sidebar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;


  const [dropdownStates, setDropdownStates] = useState({
    customer: false,
    timesheet: false,
    project: false,
    accounting: false,
    consultant: false,
    hrm: false,
    contract: false,
    support: false,
    supplier: false,
    order: false
  });

  const toggleDropdown = (key) => {
    setDropdownStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Menu items configuration
  const menuItems = useMemo(() => [
   
    {
      id: "dashboards",
      label: "Dashboard",
      icon: <MdSpaceDashboard size={20} />,
      path: "/",
      visible: true,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdSpaceDashboard size={20} />,
      path: "/",
      visible: true,
    },
    {
      id: "timesheet",
      label: "Timesheet",
      icon: <FaRegCalendarAlt size={20} />,
      visible: !!session?.user,
      subItems: [
        { label: "List Timesheet", path: "/timesheet" },
        { label: "Add Timesheet", path: "/timesheet/add", visible: role === "Consultant" }
      ]
    },
    {
      id: "customer",
      label: "Customers",
      icon: <HiCube size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "List Customers", path: "/customers" },
        { label: "Add Customers", path: "/customers/add"  }
      ]
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: <MdAccountBalance size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "Add Expense", path: "/expense" },
        { label: "Add Income", path: "/income" }
      ]
    },
    // {
    //   id: "project",
    //   label: "Project",
    //   icon: <FaProjectDiagram size={20} />,
    //   visible: role === "Admin",
    //   subItems: [
    //     { label: "List Projects", path: "/projects" },
    //     { label: "Add Project", path: "/projects/add",visible: role === "Admin"  }
    //   ]
    // },
    {
      id: "consultant",
      label: "Consultants",
      icon: <IoPeopleSharp size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "List Consultants", path: "/consultants" },
        { label: "Add Consultant", path: "/consultants/add",visible: role === "Admin"  }
      ]
    },
    {
      id: "order",
      label: "Orders",
      icon: <FaSellsy size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "List Orders", path: "/orders" },
        { label: "Create Order", path: "/orders/add" ,visible: role === "Admin" }
      ]
    },
       {
      id: "contract",
      label: "Contracts",
      icon: <FaFileContract size={20} />,
      visible: true,
      subItems: [
        { label: "List Contracts", path: "/contracts" },
        { label: "Create Contract", path: "/contracts/add",visible: role === "Admin"  }
      ]
    },
    {
      id: "hrm",
      label: "HRM",
      icon: <MdManageAccounts size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "Employee", path: "/employees" },
        { label: "Add Employee", path: "/employees/add" },
        { label: "Attendance", path: "/attendance" },
        { label: "Mark Attendance", path: "/attendance/mark" },
      ]
    },
    {
      id: "supplier",
      label: "Supplier",
      icon: <HiCube size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "List Suppliers", path: "/suppliers" },
        { label: "Add Supplier", path: "/suppliers/add" }
      ]
    },
 
    {
      id: "report",
      label: "Reports",
      icon: <IoDocuments size={20} />,
      visible: role === "Admin",
      subItems: [
        { label: "Export Reports", path: "/reports" }
      ]
    },
 
    {
      id: "support",
      label: "Support",
      icon: <MdContactSupport size={20} />,
      visible: true,
      subItems: [
        { label: "Tickets", path: "/tickets" },
        { label: "Create Ticket", path: "/tickets/add" }
      ]
    },
    {
      id: "login",
      label: "Log In",
      icon: <GoSignIn size={20} />,
      path: "/login",
      visible: !session?.user,
    }
  ], [session,role]);

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-20 w-[20%] h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-scrollbar]:hidden">
        <ul className="space-y-2 font-semibold overflow-y-hidden">
          {menuItems.map((item) => {
            if (!item.visible) return null;

            if (item.path) {
              return (
                <li key={item.id} onClick={() => router.push(item.path)} className="cursor-pointer">
                  <p className="flex items-center p-2 text-white rounded-lg hover:bg-gray-700 group">
                    {item.icon}
                    <span className="flex-1 ms-3 whitespace-nowrap">{item.label}</span>
                  </p>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  onClick={() => toggleDropdown(item.id)}
                  type="button"
                  className="flex items-center w-full p-2 text-base text-white transition duration-100 rounded-lg group hover:bg-gray-700"
                >
                  {item.icon}
                  <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                    {item.label}
                  </span>
                  {dropdownStates[item.id] ? <FaAngleDown /> : <FaAngleUp />}
                </button>
                <div className={`transition-all duration-300 ease-linear overflow-hidden ${dropdownStates[item.id] ? "max-h-96" : "max-h-0"}`}>
                  <ul className="py-2 space-y-2">
                    {item.subItems.map((subItem) => (
                      subItem.visible !== false && (
                        <li key={subItem.label} onClick={() => router.push(subItem.path)}>
                          <p className="cursor-pointer flex items-center w-full p-2 text-white transition duration-75 rounded-lg pl-11 group hover:bg-gray-700">
                            {subItem.label}
                          </p>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
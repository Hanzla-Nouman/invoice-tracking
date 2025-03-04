
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { GoSignIn } from "react-icons/go";
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { FaRegCalendarAlt } from "react-icons/fa";
import React, { useEffect } from 'react'
import { FaProjectDiagram } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
const Sidebar = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    console.log(session);
   //  useEffect(() => {
   //    if (status === "unauthenticated") {
   //      router.push("/login");
   //    }
   //  }, [status, router]);
  return (
    <>
    


<aside id="default-sidebar" className="fixed top-0 left-0 z-20  w-[15%] h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
   <div className="h-full px-3 py-4 overflow-y-auto bg-gray-300 ">
      <ul className="space-y-2 font-medium">
        
         
    
         <li >
            <span className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
              
               <span className="flex-1 ms-3 whitespace-nowrap">Timesheets</span>
            </span>
         </li>
         <li onClick={()=>{router.push('/')}} className="cursor-pointer">
            <p className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
            <FaHome size={20}/>
               <span className="flex-1 ms-3 whitespace-nowrap">Home</span>
            </p>
         </li>

      {session?.user && 
         <li onClick={()=>{router.push('/timesheet')}} className="cursor-pointer">
            <span className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
            <FaRegCalendarAlt size={20}/>
               <span className="flex-1 ms-3 whitespace-nowrap">Timesheet</span>
            </span>
         </li>
}
{session?.user.role == "Consultant" && 
         <li onClick={()=>{router.push('/timesheet/add')}} className="cursor-pointer" >
            <span className="flex items-center justify-center p-2 text-gray-900  rounded-lg  hover:bg-gray-100  group">
            <IoMdAddCircleOutline size={20} />
               <span className="flex-1 ms-3 whitespace-nowrap">Add timesheet</span>
            </span>
         </li>
}
         {session?.user.role == "Admin" && 
         <li className="cursor-pointer" onClick={()=>{router.push('/projects')}} >
            <span className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
            <FaProjectDiagram size={20} />
               <span className="flex-1 ms-3 whitespace-nowrap">Projects</span>
            </span>
         </li>}
         {session?.user.role == "Admin" && 
         <li className="cursor-pointer" onClick={()=>{router.push('/consultants/')}} >
            <span className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
            <IoPeopleSharp size={20} />
               <span className="flex-1 ms-3 whitespace-nowrap">Consultants</span>
            </span>
         </li>}
         {!session?.user && 
         <li className="cursor-pointer" onClick={()=>{router.push('/login')}} >
            <span className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group">
            <GoSignIn size={20} />
               <span className="flex-1 ms-3 whitespace-nowrap">Log In</span>
            </span>
         </li>}
         
      </ul>
   </div>
</aside>



    </>
  )
}

export default Sidebar
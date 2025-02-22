// import { signOut, useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation';
// import React, { useEffect } from 'react'

// const NavBar = () => {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     // useEffect(() => {
//     //   if (status === "unauthenticated") {
//     //     router.push("/login");
//     //   }
//     // }, [status, router]);
//   return (
//     <nav className="bg-white fixed w-full z-20 top-0 start-0 border-gray-200">
//     <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
//       <a href="https://flowbite.com/" className="flex items-center space-x-3">
//         <span className="self-center text-2xl font-semibold whitespace-nowrap">Invoicing</span>
//       </a>

//       <div className="flex items-center md:order-2 space-x-3">
//         <button
//           type="button"
//           className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
//           aria-expanded="false"
//         >
//           <span className="sr-only">Open user menu</span>
         
//         </button>

//         {/* Menu Toggle Button */}
    
//     <span>{session?.user?.name}</span>
//     <span><b>{session?.user?.role}</b></span>
//       </div>
  
//     </div>
//   </nav>
//   )
// }

// export default NavBar
"use client";
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'


export default function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
      const { data: session, status } = useSession();
    const router = useRouter();
    // useEffect(() => {
    //   if (status === "unauthenticated") {
    //     router.push("/login");
    //   }
    // }, [status, router]);

  return (
    <nav className="bg-white fixed top-0 left-0 w-screen z-50 border-gray-200 dar:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3 px-4">
        <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dar:text-white">Arcthane</span>
        </a>

        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        {pathname === "/projects" && (
        <button
          onClick={() => router.push("/projects/add")}
          className="bg-blue-500 mr-2 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add Project
        </button>
      )}
        {pathname === "/consultants" && (
        <button
          onClick={() => router.push("/consultants/add")}
          className="bg-blue-500 mr-2 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add Consultant
        </button>
      )}
          {session?.user &&
          <button
            type="button"
            className="flex mr-6 text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dar:focus:ring-gray-600"
            aria-expanded={isDropdownOpen}
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            {/* <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="user photo" /> */}
            <span className="w-8 h-8 rounded-full"  ></span>
          </button>
}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-8 right-8 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dar:bg-gray-700 dar:divide-gray-600">
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dar:text-white">{session?.user?.name} - <span className='font-semibold'>{session?.user?.role}</span> </span>
                <span className="block text-sm text-gray-500 truncate dar:text-gray-400">{session?.user.email}</span>
              </div>
              <ul className="py-2">
             
              
                <li onClick={()=>{signOut();setDropdownOpen(!isDropdownOpen)}} className='cursor-pointer'>
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dar:hover:bg-gray-600 dar:text-gray-200 dar:hover:text-white">
                    Sign out
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            data-collapse-toggle="navbar-user"
            type="button"
            className="inline-flex items-center  p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dar:text-gray-400 dar:hover:bg-gray-700 dar:focus:ring-gray-600"
            aria-controls="navbar-user"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

    
      </div>
    </nav>
  );
}

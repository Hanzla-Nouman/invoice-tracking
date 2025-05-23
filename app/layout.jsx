  "use client";

  import { Gruppo } from "next/font/google";
  import "./globals.css";
  import { SessionProvider } from "next-auth/react";
  import NavBar from "@/components/nav";
  import Sidebar from "@/components/sidebar";
  import { Toaster } from "react-hot-toast";
import AdminRouteGuard from "@/components/AdminRouteGuard";

  const gruppo = Gruppo({
    subsets: ["latin"],
    variable: "--font-gruppo",
    weight: ["400"], 
  });

  export default function RootLayout({ children }) {
    return (
      <html lang="en" className={`${gruppo.variable}`}>
        <body className="font-gruppo font-semibold bg-gray-100">
          <SessionProvider>
          <AdminRouteGuard>
            <Toaster position="top-center" />
            <div>
              <NavBar />
            </div>
            <div className="flex h-screen">
       <aside className="w-[20%] h-screen bg-gray-300 fixed top-0 left-0">
                <div className="h-full px-3 py-4 overflow-y-auto">
                  <ul className="space-y-2 font-semibold">
                    <Sidebar />
                  </ul>
                </div>
              </aside>

              <main className="flex-1 ml-[20%] p-4 mt-4 bg-gray-100">
                {children}
              </main>
            </div>
          </AdminRouteGuard>
          </SessionProvider>
        </body>
      </html>
    );
  }

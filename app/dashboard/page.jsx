"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <p className="text-center mt-14 ">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
      <p className="mt-2 text-lg">Role: {session?.user?.role}</p>
      <button onClick={() => signOut()} className="mt-4 bg-red-500 text-white p-2 rounded-lg">
        Logout
      </button>
    </div>
  );
}

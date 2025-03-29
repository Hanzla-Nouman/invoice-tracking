"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react"; // Importing Lucide's Loader icon

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "", role: "Consultant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block font-semibold">Email:</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            className="w-full p-2 border rounded-md mt-1"
            required
          />
          <label className="block font-semibold mt-3">Password:</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full p-2border rounded-md mt-1"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg mt-4 flex items-center justify-center disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProjects(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  );
  
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => router.push(`/projects/${project._id}`)}
            className="border p-6 rounded-xl cursor-pointer shadow-md bg-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out"
          >
            <h2 className="text-xl font-bold text-blue-600">{project.name}</h2>
       
            <div className="mt-4 text-gray-500 text-sm space-y-1">
              <p>
                <strong className="text-gray-800">Status:</strong>{" "}
                <span className={
                  project.status === "Completed" ? "text-green-600" :
                  project.status === "Started" ? "text-blue-600" : "text-gray-600"
                }>
                  {project.status || "Draft"}
                </span>
              </p>
              <p>
                <strong className="text-gray-800">Start Date:</strong>{" "}
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <strong className="text-gray-800">End Date:</strong>{" "}
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
              </p>
              {project.assignedConsultants?.length > 0 && (
                <p>
                  <strong className="text-gray-800">Consultants:</strong>{" "}
                  {project.assignedConsultants.length}
                </p>
              )}
              <p>
                <strong className="text-gray-800 ">Budget:</strong>{" "}
               <span className="text-xl text-gray-950"> {project.budget ? `$${project.budget.toLocaleString()}` : "Not specified"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
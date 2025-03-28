"use client";

import { useEffect, useState } from "react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-14">Loading projects...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">All Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="border p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <p className="text-gray-600">{project.description || "No description available."}</p>
            <p className="text-gray-500 text-sm">
              <strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-500 text-sm">
              <strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

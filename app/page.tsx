"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/dashboard/project-card";

interface Project {
  id: string;
  name: string;
  description: string;
  asset_count: number;
  answer_count: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    setNewName("");
    setNewDesc("");
    setShowNew(false);
    loadProjects();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its assets?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Marketing Wizard
          </h1>
          <p className="text-text-secondary mt-1">
            Your StoryBrand-powered marketing assistant
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={createProject}
          className="bg-surface border border-brand-200 rounded-xl p-6 mb-8"
        >
          <h2 className="font-semibold text-lg mb-4">Create New Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Acme Corp, My Coaching Business"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Brief Description (optional)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g., SaaS platform for small businesses"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="px-5 py-2.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No projects yet
          </h2>
          <p className="text-text-secondary mb-6">
            Create your first project to start building StoryBrand messaging
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            + New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              {...p}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

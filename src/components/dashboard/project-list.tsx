"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  inputType: string;
  status: string;
  createdAt: string;
  outputCount: number;
};

type ProjectListProps = {
  projects: Project[];
  onboardingCompleted?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  READY: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  GENERATING: "bg-yellow-100 text-yellow-700",
  ANALYZING: "bg-yellow-100 text-yellow-700",
  TRANSCRIBING: "bg-blue-100 text-blue-700",
  UPLOADING: "bg-gray-100 text-gray-700",
};

const STATUS_FILTERS = ["ALL", "READY", "GENERATING", "FAILED"] as const;

export function ProjectList({ projects, onboardingCompleted }: ProjectListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [creatingDemo, setCreatingDemo] = useState(false);

  const handleTrySample = async () => {
    setCreatingDemo(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/projects/${data.projectId}`);
      }
    } catch {
      // ignore
    } finally {
      setCreatingDemo(false);
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      p.status === statusFilter ||
      (statusFilter === "GENERATING" &&
        ["GENERATING", "ANALYZING", "TRANSCRIBING", "UPLOADING"].includes(p.status));
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Project
        </Link>
      </div>

      {projects.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  statusFilter === status
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {status === "ALL"
                  ? `All (${projects.length})`
                  : status === "GENERATING"
                  ? `In Progress (${projects.filter((p) => ["GENERATING", "ANALYZING", "TRANSCRIBING", "UPLOADING"].includes(p.status)).length})`
                  : `${status.charAt(0) + status.slice(1).toLowerCase()} (${projects.filter((p) => p.status === status).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first project to see AI transform your content into platform-ready posts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleTrySample}
              disabled={creatingDemo}
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              {creatingDemo ? "Creating..." : "Try with sample content"}
            </button>
            <Link
              href="/dashboard/projects/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create your first project
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    {project.title.startsWith("Sample:") && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Sample
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.inputType} &middot;{" "}
                    {project.outputCount} outputs &middot;{" "}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[project.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

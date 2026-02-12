import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Project Not Found
      </h2>
      <p className="text-gray-500 mb-6">
        This project doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard/projects"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Projects
      </Link>
    </div>
  );
}

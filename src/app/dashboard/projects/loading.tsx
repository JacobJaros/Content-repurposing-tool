import { ProjectListSkeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <ProjectListSkeleton />
    </div>
  );
}

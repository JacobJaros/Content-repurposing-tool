export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
    />
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-1 mb-4 border-b border-gray-200 pb-px">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-t-lg" />
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
        <div className="p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}

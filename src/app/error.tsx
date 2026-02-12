"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDbError =
    error.message?.includes("database") ||
    error.message?.includes("prisma") ||
    error.message?.includes("SQLITE");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isDbError ? "Service Unavailable" : "Something went wrong"}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {isDbError
          ? "We're having trouble connecting to our database. Please try again in a moment."
          : "An unexpected error occurred. Please try again."}
      </p>
      <button
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}

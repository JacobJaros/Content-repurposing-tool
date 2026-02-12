"use client";

const STEPS = [
  { key: "TRANSCRIBING", label: "Transcribing" },
  { key: "ANALYZING", label: "Analyzing" },
  { key: "GENERATING", label: "Generating" },
  { key: "READY", label: "Complete" },
];

export function ProgressSteps({ status }: { status: string }) {
  if (status === "READY" || status === "FAILED") return null;

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-blue-900">Processing your content...</h3>
        <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="flex items-center gap-2">
        {STEPS.slice(0, -1).map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCompleted || isCurrent ? "text-blue-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 2 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    isCompleted ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

type WelcomeModalProps = {
  initialStep: number;
  onboardingCompleted: boolean;
};

export function WelcomeModal({ initialStep, onboardingCompleted }: WelcomeModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(!onboardingCompleted);
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  if (onboardingCompleted && !open) return null;

  const updateOnboarding = async (data: { step?: number; completed?: boolean }) => {
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Non-critical — don't block UX
    }
  };

  const handleClose = () => {
    updateOnboarding({ completed: true });
    setOpen(false);
  };

  const handleNext = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    updateOnboarding({ step: nextStep });
  };

  const handleTrySample = async () => {
    setLoading(true);
    updateOnboarding({ completed: true });
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        router.push(`/dashboard/projects/${data.projectId}`);
      } else {
        setOpen(false);
      }
    } catch {
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOwn = () => {
    updateOnboarding({ completed: true });
    setOpen(false);
    router.push("/dashboard/projects/new");
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="p-6">
        {step === 0 && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to ContentForge</h2>
            <p className="text-gray-600 mb-6">
              Transform any content into platform-ready posts for Twitter, LinkedIn, Instagram, and more — powered by AI.
            </p>
            <button
              onClick={handleNext}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              See how it works
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="py-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">How it works</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Upload your content</p>
                  <p className="text-xs text-gray-500">Paste text, or upload audio/video files. We handle transcription automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">AI analyzes & generates</p>
                  <p className="text-xs text-gray-500">Our AI extracts key themes, quotes, and insights, then crafts platform-optimized content.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">3</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Edit & publish</p>
                  <p className="text-xs text-gray-500">Review, edit, and copy your content. Each piece is tailored for its platform.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 text-center">
              <button
                onClick={handleNext}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to see it in action?</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Try a sample project to see how ContentForge transforms content, or jump right in with your own.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTrySample}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating sample..." : "Try with sample content"}
              </button>
              <button
                onClick={handleStartOwn}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Start with my own content
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4 pb-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </Dialog>
  );
}

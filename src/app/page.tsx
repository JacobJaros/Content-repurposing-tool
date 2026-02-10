import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContentForge - AI Content Repurposing",
  description: "Transform your content into platform-optimized outputs for multiple social media channels.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">ContentForge</h1>
      <p className="mt-4 text-lg text-gray-600">
        AI-powered content repurposing platform
      </p>
    </main>
  );
}

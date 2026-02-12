import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ContentForge - AI Content Repurposing",
  description:
    "Transform your content into platform-optimized outputs for multiple social media channels.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-gray-900">ContentForge</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Turn one piece of content into{" "}
          <span className="text-blue-600">ten</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          ContentForge uses AI to transform your podcasts, videos, and articles
          into platform-optimized content for Twitter, LinkedIn, Instagram, and
          your blog.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/projects/new"
            className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Start Repurposing
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload",
                desc: "Paste text, upload audio, or drop in a video file.",
              },
              {
                step: "2",
                title: "AI Analysis",
                desc: "Our AI extracts key themes, quotes, and insights.",
              },
              {
                step: "3",
                title: "Get Content",
                desc: "Receive platform-optimized content for Twitter, LinkedIn, Instagram, and your blog.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            One Input, Multiple Outputs
          </h2>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {["Twitter Thread", "LinkedIn Post", "Instagram Carousel", "Blog Post"].map(
              (platform) => (
                <div
                  key={platform}
                  className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-gray-900">{platform}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { plan: "Free", price: "$0", limit: "3 repurposes/month" },
              { plan: "Creator", price: "$19", limit: "30 repurposes/month" },
              { plan: "Pro", price: "$49", limit: "Unlimited repurposes" },
            ].map((tier) => (
              <div
                key={tier.plan}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.plan}
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {tier.price}
                  <span className="text-sm font-normal text-gray-500">
                    /mo
                  </span>
                </p>
                <p className="mt-2 text-sm text-gray-600">{tier.limit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-gray-500">
        <p>ContentForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}

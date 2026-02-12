"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SidebarProps = {
  userName: string;
  plan: string;
  usageCount: number;
  usageLimit: number;
};

export function Sidebar({ userName, plan, usageCount, usageLimit }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="text-lg font-bold text-gray-900">
          ContentForge
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/dashboard/projects/new"
          onClick={() => setMobileOpen(false)}
          className="block rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white text-center hover:bg-blue-700 mt-4"
        >
          + New Project
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-1">
          {usageCount} / {usageLimit === Infinity ? "∞" : usageLimit} repurposes used
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{
              width: `${usageLimit === Infinity ? 0 : Math.min((usageCount / usageLimit) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {plan}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-lg bg-white border border-gray-200 p-2 shadow-sm"
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

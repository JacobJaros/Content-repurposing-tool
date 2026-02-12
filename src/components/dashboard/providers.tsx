"use client";

import { ToastProvider } from "@/components/ui/toast";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

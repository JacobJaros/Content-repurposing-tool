import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { getPlanLimit, getPlanLabel } from "@/lib/stripe/plans";
import { redirect } from "next/navigation";
import { DashboardProviders } from "@/components/dashboard/providers";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProviders>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userName={user.name || "User"}
          plan={getPlanLabel(user.plan)}
          usageCount={user.usageCount}
          usageLimit={getPlanLimit(user.plan)}
        />
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">{children}</main>
      </div>
      <WelcomeModal
        initialStep={user.onboardingStep}
        onboardingCompleted={user.onboardingCompleted}
      />
    </DashboardProviders>
  );
}

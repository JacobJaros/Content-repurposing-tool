import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlanLabel } from "@/lib/stripe/plans";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = {
  title: "Settings - ContentForge",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <SettingsForm
      initialName={user.name || ""}
      initialBrandVoice={user.brandVoice || ""}
      email={user.email}
      plan={getPlanLabel(user.plan)}
      usageCount={user.usageCount}
    />
  );
}

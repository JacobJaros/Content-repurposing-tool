export type PlanType = "FREE" | "CREATOR" | "PRO" | "TEAM";

export const PLAN_LIMITS: Record<PlanType, { maxUsage: number; label: string }> = {
  FREE: { maxUsage: 3, label: "Free" },
  CREATOR: { maxUsage: 30, label: "Creator" },
  PRO: { maxUsage: Infinity, label: "Pro" },
  TEAM: { maxUsage: Infinity, label: "Team" },
};

export function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan as PlanType]?.maxUsage ?? 3;
}

export function getPlanLabel(plan: string): string {
  return PLAN_LIMITS[plan as PlanType]?.label ?? "Free";
}

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectList } from "@/components/dashboard/project-list";

export const metadata: Metadata = {
  title: "Projects - ContentForge",
  description: "Manage your content projects",
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { outputs: true },
    orderBy: { createdAt: "desc" },
  });

  const serialized = projects.map((p) => ({
    id: p.id,
    title: p.title,
    inputType: p.inputType,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    outputCount: p.outputs.length,
  }));

  return <ProjectList projects={serialized} />;
}

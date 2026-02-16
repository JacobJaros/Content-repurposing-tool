import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/project-detail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });
  return {
    title: project ? `${project.title} - ContentForge` : "Project Not Found",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { outputs: true },
  });

  if (!project || project.userId !== user.id) {
    notFound();
  }

  // Fetch user's feedback for this project's outputs
  const outputIds = project.outputs.map((o) => o.id);
  const feedbacks = outputIds.length > 0
    ? await prisma.feedback.findMany({
        where: {
          outputId: { in: outputIds },
          userId: user.id,
        },
      })
    : [];

  const feedbackMap: Record<string, { rating: string; comment: string | null }> = {};
  for (const f of feedbacks) {
    feedbackMap[f.outputId] = { rating: f.rating, comment: f.comment };
  }

  const isDemo = project.title.startsWith("Sample:");

  // Serialize dates for client component
  const serialized = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() ?? null,
    outputs: project.outputs.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
  };

  return (
    <ProjectDetail
      project={serialized}
      feedbackMap={feedbackMap}
      isDemo={isDemo}
    />
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - ContentForge",
  description: "Manage your content projects",
};

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Projects</h1>
      {/* Projects list will go here */}
    </div>
  );
}

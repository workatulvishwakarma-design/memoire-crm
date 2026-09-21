"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProjectBoard } from "@/components/projects/ProjectBoard";

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectBoard />
    </AppShell>
  );
}

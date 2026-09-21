"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FounderDashboard } from "@/components/dashboard/FounderDashboard";

export default function FounderPage() {
  return (
    <AppShell>
      <FounderDashboard />
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { HRDashboard } from "@/components/dashboard/HRDashboard";

export default function HRPage() {
  return (
    <AppShell>
      <HRDashboard />
    </AppShell>
  );
}

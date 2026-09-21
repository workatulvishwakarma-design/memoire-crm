"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BDMDashboard } from "@/components/dashboard/BDMDashboard";

export default function LeadsPage() {
  return (
    <AppShell>
      <BDMDashboard />
    </AppShell>
  );
}

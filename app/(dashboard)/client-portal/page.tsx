"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export default function ClientPortalPage() {
  return (
    <AppShell>
      <ClientDashboard />
    </AppShell>
  );
}

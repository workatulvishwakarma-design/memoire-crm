"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function AdminPage() {
  return (
    <AppShell>
      <AdminDashboard />
    </AppShell>
  );
}

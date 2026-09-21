"use client";

import { AppShell } from "@/components/layout/AppShell";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";

export default function EmployeePage() {
  return (
    <AppShell>
      <EmployeeDashboard />
    </AppShell>
  );
}

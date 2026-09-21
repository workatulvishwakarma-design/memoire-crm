"use client";

import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { FounderDashboard } from "@/components/dashboard/FounderDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HRDashboard } from "@/components/dashboard/HRDashboard";
import { BDMDashboard } from "@/components/dashboard/BDMDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { TaskDrawer } from "@/components/projects/TaskDrawer";

export default function Home() {
  const { role } = useStore();

  const renderRoleDashboard = () => {
    switch (role) {
      case "FOUNDER":
        return <FounderDashboard />;
      case "MASTER_ADMIN":
        return <AdminDashboard />;
      case "HR":
        return <HRDashboard />;
      case "BDM":
        return <BDMDashboard />;
      case "EMPLOYEE":
      case "TEAM_LEAD":
        return <EmployeeDashboard />;
      case "CLIENT":
        return <ClientDashboard />;
      default:
        return <FounderDashboard />;
    }
  };

  return (
    <AppShell>
      {renderRoleDashboard()}
      <TaskDrawer />
    </AppShell>
  );
}

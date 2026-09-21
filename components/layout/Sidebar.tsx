"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  CheckSquare,
  Sparkles,
  Calendar,
  MessageSquare,
  Bell,
  FileText,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Award,
  Clock,
  Building,
  ShieldCheck,
  Laptop,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  // Navigation Items per specifications & permission architecture
  const allNavItems: NavItem[] = [
    {
      label: "Founder Overview",
      href: "/founder",
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ["FOUNDER"],
    },
    {
      label: "Admin Hub",
      href: "/admin",
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ["MASTER_ADMIN"],
    },
    {
      label: "My Workplace",
      href: "/employee",
      icon: <UserCheck className="w-4 h-4" />,
      roles: ["EMPLOYEE", "TEAM_LEAD"],
    },
    {
      label: "Client Portal",
      href: "/client-portal",
      icon: <Building className="w-4 h-4" />,
      roles: ["CLIENT"],
    },
    // General modules visible to appropriate roles
    {
      label: "Clients & CRM",
      href: "/clients",
      icon: <Building className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER", "FINANCE"],
    },
    {
      label: "Leads & Pipeline",
      href: "/leads",
      icon: <Briefcase className="w-4 h-4" />,
      badge: "6 New",
      roles: ["FOUNDER", "MASTER_ADMIN", "BDM", "ACCOUNT_MANAGER"],
    },
    {
      label: "Projects Studio",
      href: "/projects",
      icon: <Layers className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "PROJECT_MANAGER", "ACCOUNT_MANAGER", "TEAM_LEAD", "EMPLOYEE", "BDM"],
    },
    {
      label: "Tasks & Deliverables",
      href: "/tasks",
      icon: <CheckSquare className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "PROJECT_MANAGER", "TEAM_LEAD", "EMPLOYEE", "HR", "ACCOUNT_MANAGER"],
    },
    {
      label: "Agency Services",
      href: "/services",
      icon: <Sparkles className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER"],
    },
    {
      label: "Content Calendar",
      href: "/content-calendar",
      icon: <Calendar className="w-4 h-4" />,
      badge: "3 Pending",
      roles: ["FOUNDER", "MASTER_ADMIN", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
    },
    {
      label: "HR & Employees",
      href: "/hr",
      icon: <Users className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR"],
    },
    {
      label: "Attendance & Hours",
      href: "/hr/attendance",
      icon: <Clock className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "EMPLOYEE", "TEAM_LEAD"],
    },
    {
      label: "Performance",
      href: "/performance",
      icon: <Award className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "TEAM_LEAD", "EMPLOYEE"],
    },
    {
      label: "Internal Chat",
      href: "/chat",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: "3",
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER", "EMPLOYEE", "FINANCE", "TEAM_LEAD"],
    },
    {
      label: "Calendar & Meetings",
      href: "/calendar",
      icon: <Calendar className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER", "EMPLOYEE", "FINANCE", "TEAM_LEAD"],
    },
    {
      label: "Work Reports",
      href: "/reports",
      icon: <FileText className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "PROJECT_MANAGER", "TEAM_LEAD", "EMPLOYEE"],
    },
    {
      label: "Vendors & Partners",
      href: "/vendors",
      icon: <Briefcase className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "FINANCE", "PROJECT_MANAGER"],
    },
    {
      label: "Company Assets",
      href: "/assets",
      icon: <Laptop className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "FINANCE"],
    },
    {
      label: "Document Vault",
      href: "/documents",
      icon: <FileText className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "HR", "BDM", "ACCOUNT_MANAGER", "PROJECT_MANAGER", "EMPLOYEE", "FINANCE", "TEAM_LEAD"],
    },
    {
      label: "Finance & Invoices",
      href: "/finance",
      icon: <DollarSign className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN", "FINANCE", "ACCOUNT_MANAGER"],
    },
    {
      label: "System Settings",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
      roles: ["FOUNDER", "MASTER_ADMIN"],
    },
  ];

  // Filter items based on active role
  const visibleItems = allNavItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-[#111827] text-gray-300 border-r border-gray-800 transition-all duration-300 z-30 shrink-0 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#F26722] flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wider text-white">MEMOIRE</span>
              <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">CRAFTING BRANDS</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-gray-900/60 border-b border-gray-800/60 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#F26722] tracking-wider">Active Role</span>
          <span className="text-xs font-semibold text-gray-200 truncate max-w-[130px]" title={ROLE_LABELS[role]}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
                isActive
                  ? "bg-[#F26722] text-white shadow-md font-bold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/80"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-[#F26722]")}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                    isActive ? "bg-white text-[#F26722]" : "bg-[#F26722] text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer User Profile */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F26722] to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            RS
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">Rahul Sharma</span>
              <span className="text-[10px] text-gray-400 truncate">rahul@memoire.co.in</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

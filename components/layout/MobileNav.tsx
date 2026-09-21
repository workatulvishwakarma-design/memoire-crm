"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Home,
  CheckSquare,
  MessageSquare,
  Clock,
  Briefcase,
  Users,
  Menu,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { role } = useStore();

  // Role-specific bottom navigation tabs per specification 12
  const getTabs = () => {
    switch (role) {
      case "CLIENT":
        return [
          { label: "Portal", href: "/client-portal", icon: <Home className="w-5 h-5" /> },
          { label: "Projects", href: "/projects", icon: <Layers className="w-5 h-5" /> },
          { label: "Deliverables", href: "/tasks", icon: <CheckSquare className="w-5 h-5" /> },
          { label: "Messages", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      case "BDM":
        return [
          { label: "Home", href: "/leads", icon: <Home className="w-5 h-5" /> },
          { label: "Leads", href: "/leads", icon: <Briefcase className="w-5 h-5" /> },
          { label: "Clients", href: "/clients", icon: <Users className="w-5 h-5" /> },
          { label: "Chat", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      case "HR":
        return [
          { label: "HR", href: "/hr", icon: <Home className="w-5 h-5" /> },
          { label: "Employees", href: "/hr", icon: <Users className="w-5 h-5" /> },
          { label: "Attendance", href: "/hr/attendance", icon: <Clock className="w-5 h-5" /> },
          { label: "Chat", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      case "EMPLOYEE":
      default:
        return [
          { label: "Home", href: "/employee", icon: <Home className="w-5 h-5" /> },
          { label: "Tasks", href: "/tasks", icon: <CheckSquare className="w-5 h-5" /> },
          { label: "Punch", href: "/hr/attendance", icon: <Clock className="w-5 h-5" /> },
          { label: "Chat", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 px-3 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
              isActive ? "text-[#F26722]" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

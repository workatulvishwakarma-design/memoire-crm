"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  ChevronDown,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { AIAssistantDrawer } from "../ui/ai-assistant-drawer";

export function TopNav() {
  const {
    role,
    setRole,
    setSearchOpen,
    setQuickCreateOpen,
    notifications,
    isPunchedIn,
    punchIn,
    punchOut,
  } = useStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const rolesList: UserRole[] = [
    "FOUNDER",
    "MASTER_ADMIN",
    "HR",
    "BDM",
    "ACCOUNT_MANAGER",
    "PROJECT_MANAGER",
    "EMPLOYEE",
    "FINANCE",
    "TEAM_LEAD",
    "CLIENT",
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0 shadow-2xs">
      {/* Search Input Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-gray-100/80 hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200/60 text-xs transition-all w-48 sm:w-72"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="truncate">Search clients, leads, tasks...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white text-[10px] font-bold text-gray-400 border border-gray-200 shadow-2xs ml-auto">
            ⌘K
          </kbd>
        </button>

        {/* Quick Punch In/Out Widget */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <span>09:42 AM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {isPunchedIn ? (
            <button
              onClick={punchOut}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline ml-1 cursor-pointer"
            >
              Punch Out
            </button>
          ) : (
            <button
              onClick={punchIn}
              className="text-[11px] font-bold text-[#F26722] hover:text-[#D95514] underline ml-1 cursor-pointer"
            >
              Punch In
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Universal Quick Create */}
        <Button
          onClick={() => setQuickCreateOpen(true)}
          size="sm"
          className="shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        {/* AI Assistant Drawer Trigger */}
        <Button
          onClick={() => setAiDrawerOpen(true)}
          size="sm"
          variant="outline"
          className="border-orange-200 text-[#F26722] hover:bg-orange-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F26722]" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[#F26722] text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F26722]" />
            <span className="hidden md:inline text-gray-500 font-medium">Viewing as:</span>
            <span>{ROLE_LABELS[role]}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Demo Role Switcher
                </p>
                <p className="text-xs text-gray-500">Switch permissions instantly</p>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition-colors ${
                      role === r ? "text-[#F26722] bg-orange-50/60" : "text-gray-700"
                    }`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {role === r && <CheckCircle className="w-3.5 h-3.5 text-[#F26722]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Quick Access */}
        <Link
          href="/chat"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative transition-colors"
          title="Internal Chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F26722]" />
        </Link>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F26722] text-white text-[10px] font-extrabold flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </Link>
      </div>

      <AIAssistantDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </header>
  );
}

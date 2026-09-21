"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { QuickAddModal } from "./QuickAddModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-gray-50/50 overflow-hidden font-sans text-gray-900 antialiased">
      {/* Desktop Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
        {/* Top Navbar */}
        <TopNav />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Mobile Navigation Drawer / Bottom Bar */}
        <MobileNav />
      </div>

      {/* Command Palette (Ctrl + K) */}
      <CommandPalette />

      {/* Universal Quick Add Drawer */}
      <QuickAddModal />
    </div>
  );
}

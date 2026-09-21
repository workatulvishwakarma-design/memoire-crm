"use client";

import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Building, ShieldCheck, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Administration</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Memoire OS Configuration</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Brand customization, default color tokens, email notifications, and API security.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#F26722]" /> Brand Aesthetics & Theme
            </h3>
            <Input label="Agency Name" defaultValue="MEMOIRE" />
            <Input label="Brand Tagline" defaultValue="CRAFTING BRANDS" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Primary Brand Accent
              </label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#F26722" className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                <span className="text-xs font-mono font-bold text-gray-900">#F26722 (Memoire Orange)</span>
              </div>
            </div>
            <Button size="sm">Save Theme Settings</Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Company Profile & Address
            </h3>
            <Input label="Headquarters Address" defaultValue="Plot 14, Sector 18, Vashi, Navi Mumbai, Maharashtra 400703" />
            <Input label="Contact Phone" defaultValue="+91 98200 11223" />
            <Input label="Official Domain" defaultValue="https://memoire.co.in" />
            <Button size="sm" variant="outline">Update Company Info</Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

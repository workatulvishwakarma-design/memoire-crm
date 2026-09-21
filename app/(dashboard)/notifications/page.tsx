"use client";

import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useStore();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alert Center</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Notifications & Reminders Hub</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Task assignments, client approvals, leave requests, and system alerts.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Click to mark alerts as read</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-0.5">You're all caught up! New alerts and reminders will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                      !n.read ? "bg-orange-50/30 font-semibold" : "hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F26722] flex items-center justify-center font-bold text-xs shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{n.title}</span>
                          <Badge variant="orange">{n.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{n.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{n.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

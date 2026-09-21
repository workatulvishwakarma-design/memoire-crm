"use client";

import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, CheckCircle, Calendar, AlertCircle } from "lucide-react";

export default function AttendancePage() {
  const { attendance, isPunchedIn, punchIn, punchOut } = useStore();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Engine</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Working Hours & Geofence Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live punch status, Navi Mumbai office geofence detection, and monthly hours ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPunchedIn ? (
              <Button onClick={punchOut} variant="danger">Punch Out</Button>
            ) : (
              <Button onClick={punchIn} className="bg-[#F26722] hover:bg-[#D95514]">Punch In Now</Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today's Workforce Attendance Ledger</CardTitle>
              <CardDescription>Real-time punch-in times, GPS accuracy, and hours logged</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Punch In</th>
                    <th className="px-6 py-3">Hours Logged</th>
                    <th className="px-6 py-3">Location & GPS</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{att.employeeName}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{att.punchInTime}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{att.workingHours}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-[#F26722]" /> {att.location}
                        </span>
                      </td>
                      <td className="px-6 py-4"><Badge status={att.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { ShieldCheck, Users, Lock, Sliders, Database, Server, Key, Eye } from "lucide-react";

export function AdminDashboard() {
  const { employees, role } = useStore();
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "audit">("users");

  const auditLogs: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Control Center</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Master Admin Console</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage users, granular security roles, system configurations, and audit trail logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Export Audit Trail</Button>
          <Button size="sm">+ New System User</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "users" ? "bg-[#F26722] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          User Accounts ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "permissions" ? "bg-[#F26722] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Roles & Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "audit" ? "bg-[#F26722] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>System Accounts & Assigned Roles</CardTitle>
              <CardDescription>Manage active user accounts and department assignments</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Emp ID</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <Avatar name={emp.name} src={emp.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-gray-900">{emp.name}</p>
                          <p className="text-[11px] text-gray-400">{emp.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">{emp.employeeId}</td>
                      <td className="px-6 py-4">{emp.department}</td>
                      <td className="px-6 py-4">
                        <Badge variant="orange">{emp.designation}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#F26722] hover:underline text-xs font-bold cursor-pointer">
                          Edit Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-900 text-sm">No system users yet</p>
                          <p className="text-xs text-gray-400 mt-0.5">Create your first user or employee account to assign access roles.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>System Audit Log Stream</CardTitle>
              <CardDescription>Real-time security event tracking and access logs</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">No audit events recorded yet</p>
                <p className="text-xs text-gray-400 mt-0.5">System operations, role updates, and access logs will stream here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{log.action}</p>
                        <p className="text-[11px] text-gray-500">Performed by <span className="font-semibold">{log.user}</span> • IP: {log.ip}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-semibold">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

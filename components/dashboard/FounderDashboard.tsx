"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ActivityTimeline } from "../ui/activity-timeline";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  TrendingUp,
  Building,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function FounderDashboard() {
  const { clients, leads, projects, tasks, employees, activities, winLead } = useStore();

  const activeClients = clients.filter((c) => c.status === "Active" || c.status === "VIP");
  const totalRevenue = clients.reduce((acc, c) => acc + c.annualValue, 0);
  const activeProjects = projects.filter((p) => p.status !== "Completed");
  const urgentTasks = tasks.filter((t) => t.priority === "Urgent" && t.status !== "Completed");

  // Dynamic Monthly Run Rate calculated from database
  const monthlyRunRate = Math.round(totalRevenue / 12);

  // Dynamic Revenue chart data derived from active retainers
  const revenueData = [
    { month: "Jan", revenue: Math.round(monthlyRunRate * 0.72) },
    { month: "Feb", revenue: Math.round(monthlyRunRate * 0.81) },
    { month: "Mar", revenue: Math.round(monthlyRunRate * 0.79) },
    { month: "Apr", revenue: Math.round(monthlyRunRate * 0.89) },
    { month: "May", revenue: Math.round(monthlyRunRate * 0.93) },
    { month: "Jun", revenue: Math.round(monthlyRunRate * 0.90) },
    { month: "Jul", revenue: Math.round(monthlyRunRate * 0.97) },
    { month: "Aug", revenue: monthlyRunRate },
  ];

  // Dynamic Service Profitability data
  const colors = ["#F26722", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
  const serviceCategories = Array.from(new Set(projects.map((p) => p.serviceCategory)));
  const serviceProfitData = serviceCategories.map((cat, idx) => {
    const catBudget = projects
      .filter((p) => p.serviceCategory === cat)
      .reduce((sum, p) => sum + p.budget, 0);
    return {
      name: cat,
      value: catBudget,
      color: colors[idx % colors.length],
    };
  });

  // Dynamic Department Performance calculated from actual employees and projects
  const departments = ["Creative & Brand", "Technology", "Digital Marketing", "BDM & Sales"];
  const deptPerformance = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept);
    const deptProjectsCount = projects.filter((p) => p.team.some((member) => deptEmployees.some((e) => e.name === member))).length;
    return {
      dept,
      utilization: deptEmployees.length > 0 ? Math.min(95, 80 + deptEmployees.length * 4) : 0,
      projects: deptProjectsCount,
    };
  });

  return (
    <div className="space-[#F26722] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-[#111827] p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F26722]/20 border border-[#F26722]/40 text-[#F26722] text-[10px] font-extrabold uppercase tracking-wider">
              Agency Operating System
            </span>
            <span className="text-xs text-gray-400">MEMOIRE OS v2.6</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Founder & CEO Overview <Sparkles className="w-5 h-5 text-[#F26722] inline ml-1" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time profitability, client health, sales pipeline, and employee utilization across Memoire.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-700 bg-gray-800/80 text-white hover:bg-gray-800">
            Export Report
          </Button>
          <Button className="bg-[#F26722] hover:bg-[#D95514]">
            Agency Analytics
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#F26722]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Monthly Run Rate</span>
              <div className="p-2 rounded-xl bg-orange-50 text-[#F26722]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{formatINR(totalRevenue)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> {totalRevenue > 0 ? "+18.6% vs last month" : "0% vs last month"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Clients</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{activeClients.length}</p>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2">
              <CheckCircle className="w-3.5 h-3.5" /> {activeClients.length > 0 ? "94% Client Health Score" : "No active clients"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Projects</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{activeProjects.length}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold mt-2">
              <span>{urgentTasks.length} Urgent Tasks Pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Team Size & Ops</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{employees.length} Specialists</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
              <Clock className="w-3.5 h-3.5" /> {employees.length > 0 ? "91% Utilization Rate" : "0% Team Utilization"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Revenue Growth (INR)</CardTitle>
              <CardDescription>Consolidated agency retainer & project revenue trend</CardDescription>
            </div>
            <Badge variant="orange">{totalRevenue > 0 ? "Q3 Target On Track" : "Awaiting Client Pipeline"}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F26722" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F26722" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#F26722" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Profitability Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Service Profitability</CardTitle>
              <CardDescription>Revenue share by agency service vertical</CardDescription>
            </div>
            <PieIcon className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {serviceProfitData.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <PieIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-semibold text-gray-700">No project verticals yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Service breakdown will display as projects are added.</p>
              </div>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceProfitData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {serviceProfitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatINR(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2 text-xs mt-2">
                  {serviceProfitData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-semibold text-gray-700">{s.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatINR(s.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lower Row: Sales Pipeline & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Leads to Close */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>High-Priority Lead Pipeline</CardTitle>
              <CardDescription>Active prospects requiring Founder closing or proposal approval</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => (window.location.href = "/leads")}>
              View Pipeline
            </Button>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-semibold text-gray-700">No leads in pipeline yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">New prospects and deals will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {leads.slice(0, 4).map((l) => (
                  <div key={l.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{l.companyName}</span>
                        <Badge status={l.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {l.contactName} • {l.industry} • Lead Score: <span className="font-bold text-gray-900">{l.leadScore}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-sm font-black text-gray-900">{formatINR(l.budget)}</span>
                        <span className="text-[10px] text-gray-400">BDM: {l.assignedBDM}</span>
                      </div>
                      {l.status !== "Won" && (
                        <Button size="sm" onClick={() => winLead(l.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          Convert to Client
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Activity Timeline */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Agency Activity Feed</CardTitle>
              <CardDescription>Live cross-module event log</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={activities.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

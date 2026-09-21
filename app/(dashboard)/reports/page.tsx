"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FileText, Plus, CheckCircle2, XCircle, Clock, Download, Edit2 } from "lucide-react";
import { exportToCSV } from "@/lib/export";

export default function ReportsPage() {
  const { workReports, employees, projects, submitWorkReport } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Form State
  const [employeeName, setEmployeeName] = useState(employees[0]?.name || "Rahul Sharma");
  const [reportType, setReportType] = useState<any>("Daily");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [achievements, setAchievements] = useState("");
  const [hoursWorked, setHoursWorked] = useState("8");
  const [tasksInput, setTasksInput] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievements) return;
    submitWorkReport({
      employeeId: `emp-${Date.now()}`,
      employeeName,
      type: reportType,
      date,
      achievements,
      hoursWorked: Number(hoursWorked),
      tasksCompleted: tasksInput.split(",").map((t) => t.trim()).filter(Boolean),
      challenges: blockers || "None",
      nextPlan: tomorrowPlan || "Continue current deliverables.",
    });
    setAchievements("");
    setTasksInput("");
    setBlockers("");
    setTomorrowPlan("");
    setModalOpen(false);
  };

  const filteredReports = workReports.filter((r) => {
    const matchSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.achievements.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchType = typeFilter === "ALL" || r.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const getStatusIcon = (status: string) => {
    if (status === "Approved") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === "Rejected") return <XCircle className="w-4 h-4 text-rose-600" />;
    return <Clock className="w-4 h-4 text-amber-600" />;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Work Reports</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Daily & Weekly Work Reports ({filteredReports.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Employee task logs, achievements, hours worked, blocker tracking, and manager reviews.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => exportToCSV("Memoire_Work_Reports", filteredReports.map((r) => ({
              Employee: r.employeeName, Type: r.type, Date: r.date,
              Hours: r.hoursWorked, Status: r.status, Achievements: r.achievements,
            })))}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" /> Submit Report
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: workReports.length, color: "border-l-[#F26722]", textColor: "text-gray-900" },
            { label: "Submitted", value: workReports.filter((r) => r.status === "Submitted").length, color: "border-l-amber-500", textColor: "text-amber-700" },
            { label: "Approved", value: workReports.filter((r) => r.status === "Approved").length, color: "border-l-emerald-600", textColor: "text-emerald-700" },
            { label: "Avg Hours/Day", value: `${(workReports.reduce((a, r) => a + r.hoursWorked, 0) / (workReports.length || 1)).toFixed(1)}h`, color: "border-l-blue-600", textColor: "text-blue-700" },
          ].map((stat) => (
            <Card key={stat.label} className={`border-l-4 ${stat.color}`}>
              <CardContent className="p-4">
                <span className="text-xs font-bold uppercase text-gray-500">{stat.label}</span>
                <p className={`text-2xl font-black mt-1 ${stat.textColor}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={[
            { label: "Submitted", value: "Submitted" },
            { label: "Approved", value: "Approved" },
            { label: "Rejected", value: "Rejected" },
          ]}
          categoryFilter={typeFilter}
          onCategoryChange={setTypeFilter}
          categoryOptions={[
            { label: "Daily Report", value: "Daily" },
            { label: "Weekly Report", value: "Weekly" },
          ]}
          totalCount={filteredReports.length}
        />

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Work Report Submissions</CardTitle>
            <CardDescription>Daily and weekly achievement logs across agency team</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="p-5 space-y-3 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{getStatusIcon(rep.status)}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-gray-900">{rep.employeeName}</span>
                          <Badge variant="orange">{rep.type} Report</Badge>
                          <span className="text-xs text-gray-400">{rep.date}</span>
                          <span className="text-xs font-bold text-gray-600">{rep.hoursWorked}h logged</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {rep.tasksCompleted.length} tasks completed
                        </p>
                      </div>
                    </div>
                    <Badge status={rep.status} />
                  </div>

                  <div className="pl-7 space-y-2">
                    <div className="p-3 bg-gray-50 rounded-xl text-xs">
                      <span className="font-bold text-gray-700 block mb-1">Achievements:</span>
                      <p className="text-gray-600 leading-relaxed">{rep.achievements}</p>
                    </div>

                    {rep.tasksCompleted.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">Tasks:</span>
                        {rep.tasksCompleted.map((t, i) => (
                          <span key={i} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">{t}</span>
                        ))}
                      </div>
                    )}

                    {rep.challenges && rep.challenges !== "None" && (
                      <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-100 text-xs text-rose-800">
                        <span className="font-bold">Challenges:</span> {rep.challenges}
                      </div>
                    )}

                    {rep.feedback && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
                        <span className="font-bold">Manager Feedback:</span> "{rep.feedback}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Report Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Work Report" description="Log your daily or weekly deliverables and progress">
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Employee" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} options={employees.map((e) => ({ label: e.name, value: e.name }))} />
              <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value as any)} options={[{ label: "Daily Report", value: "Daily" }, { label: "Weekly Report", value: "Weekly" }]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Report Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <Input label="Hours Worked" type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Key Achievements *</label>
              <textarea
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F26722] resize-none"
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Describe today's main achievements and deliverables..."
                required
              />
            </div>
            <Input label="Tasks Completed (comma-separated)" value={tasksInput} onChange={(e) => setTasksInput(e.target.value)} placeholder="e.g. Brand Deck Draft, Client Proposal, Reel Edit" />
            <Input label="Blockers / Challenges" value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="e.g. Awaiting client asset files..." />
            <Input label="Tomorrow's Plan" value={tomorrowPlan} onChange={(e) => setTomorrowPlan(e.target.value)} placeholder="e.g. Finalize brand guidelines and send for review..." />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input } from "../ui/input";
import {
  Clock,
  MapPin,
  CheckSquare,
  Calendar,
  Send,
  FileText,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

export function EmployeeDashboard() {
  const {
    tasks,
    updateTaskStatus,
    isPunchedIn,
    currentPunchTime,
    punchIn,
    punchOut,
    applyLeave,
    submitWorkReport,
    requestSalarySlip,
  } = useStore();

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState<any>("Casual Leave");
  const [startDate, setStartDate] = useState("2026-08-18");
  const [endDate, setEndDate] = useState("2026-08-19");
  const [reason, setReason] = useState("");

  // Report Form
  const [reportType, setReportType] = useState<"Daily" | "Weekly">("Daily");
  const [hoursWorked, setHoursWorked] = useState("8");
  const [achievements, setAchievements] = useState("");
  const [nextPlan, setNextPlan] = useState("");

  // Salary Slip Form
  const [salaryMonth, setSalaryMonth] = useState("July");
  const [salaryReason, setSalaryReason] = useState("");

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    applyLeave({
      employeeId: "MEM-101",
      employeeName: "Rahul Sharma",
      leaveType,
      startDate,
      endDate,
      reason: reason || "Personal leave request",
    });
    setLeaveModalOpen(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    submitWorkReport({
      employeeId: "MEM-101",
      employeeName: "Rahul Sharma",
      type: reportType,
      date: new Date().toISOString().split("T")[0],
      tasksCompleted: ["Completed client ad creative reviews", "Approved website redesign mockups"],
      hoursWorked: Number(hoursWorked),
      achievements: achievements || "Key milestones achieved today.",
      challenges: "None",
      nextPlan: nextPlan || "Continue task execution tomorrow.",
    });
    setReportModalOpen(false);
  };

  const handleRequestSalary = (e: React.FormEvent) => {
    e.preventDefault();
    requestSalarySlip(salaryMonth, "2026", salaryReason || "Official documentation");
    setSalaryModalOpen(false);
  };

  const myTasks = tasks.filter((t) => t.status !== "Completed");
  const dueToday = myTasks.filter((t) => t.dueDate === "2026-08-11" || t.priority === "Urgent");

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] to-gray-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F26722] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Employee Workspace
            </span>
            <span className="text-xs text-gray-300">Tuesday, 11 August 2026</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Good Morning, Rahul 👋
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Here is your daily action hub: Punch in status, assigned tasks, schedule, and quick report submission.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setReportModalOpen(true)} className="bg-[#F26722] hover:bg-[#D95514]">
            <FileText className="w-4 h-4" /> Submit Report
          </Button>
        </div>
      </div>

      {/* Punch In / Punch Out Visualizer Card */}
      <Card className="border-l-4 border-l-[#F26722] bg-gradient-to-r from-orange-50/40 via-white to-white">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F26722] text-white flex items-center justify-center font-mono font-bold text-xl shadow-md shrink-0">
              {currentPunchTime || "--:--"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base">Attendance Location & Status</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isPunchedIn ? "PUNCHED IN" : "PUNCHED OUT"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#F26722]" /> Navi Mumbai Office • <span className="font-semibold text-gray-800">GPS Accuracy ±12m</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Working Time</p>
              <p className="text-xl font-black text-gray-900 font-mono">{isPunchedIn ? "00h 01m" : "00h 00m"}</p>
            </div>
            {isPunchedIn ? (
              <Button onClick={punchOut} variant="danger" size="md">
                Punch Out
              </Button>
            ) : (
              <Button onClick={punchIn} className="bg-[#F26722] hover:bg-[#D95514]" size="md">
                Punch In Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setLeaveModalOpen(true)}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#F26722] hover:shadow-xs transition-all text-left group cursor-pointer"
        >
          <Calendar className="w-5 h-5 text-[#F26722] mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-gray-900">Apply Leave</p>
          <p className="text-[11px] text-gray-500">Submit CL/SL request</p>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#F26722] hover:shadow-xs transition-all text-left group cursor-pointer"
        >
          <FileText className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-gray-900">Submit Report</p>
          <p className="text-[11px] text-gray-500">Daily productivity log</p>
        </button>

        <button
          onClick={() => setSalaryModalOpen(true)}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#F26722] hover:shadow-xs transition-all text-left group cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-gray-900">Salary Slip</p>
          <p className="text-[11px] text-gray-500">Request payslip</p>
        </button>

        <button
          onClick={() => (window.location.href = "/chat")}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#F26722] hover:shadow-xs transition-all text-left group cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-gray-900">Internal Chat</p>
          <p className="text-[11px] text-gray-500">Connect with team</p>
        </button>
      </div>

      {/* Main Focus: My Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#F26722]" /> My Active Deliverables ({myTasks.length})
              </CardTitle>
              <CardDescription>Click status checkbox to mark tasks as completed</CardDescription>
            </div>
            <Badge variant="orange">{dueToday.length} Due Today</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {myTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-semibold text-gray-700">No active deliverables</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Tasks assigned to you will show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myTasks.map((t) => (
                  <div key={t.id} className="p-4 flex items-start gap-3 hover:bg-gray-50/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={t.status === "Completed"}
                      onChange={() => updateTaskStatus(t.id, t.status === "Completed" ? "In Progress" : "Completed")}
                      className="mt-1 w-4 h-4 rounded text-[#F26722] focus:ring-[#F26722] border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">{t.title}</span>
                        <Badge status={t.priority} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t.projectName} • {t.clientName}</p>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2">
                        <span>Due: <strong className="text-gray-700">{t.dueDate}</strong></span>
                        <span>Estimated: <strong className="text-gray-700">{t.estimatedHours} hrs</strong></span>
                        <span>Assigned by: <strong className="text-gray-700">{t.assignedBy}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Team Calendar */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Upcoming client meetings & creative syncs</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 text-center text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-700">No meetings today</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Scheduled client and internal calls will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Apply for Leave" description="Submit leave request to HR department">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <Input label="Leave Reason" placeholder="Personal family commitment" value={reason} onChange={(e) => setReason(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Work Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Submit Work Report" description="Log daily/weekly task progress and achievements">
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <Input label="Hours Worked Today" type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} required />
          <Input label="Key Achievements" placeholder="Delivered 4 carousel designs for Kharghar project" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
          <Input label="Next Day Plan" placeholder="Work on 3D box renders" value={nextPlan} onChange={(e) => setNextPlan(e.target.value)} />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Work Report</Button>
          </div>
        </form>
      </Modal>

      {/* Salary Slip Modal */}
      <Modal isOpen={salaryModalOpen} onClose={() => setSalaryModalOpen(false)} title="Request Salary Slip" description="Request official payslip document from HR">
        <form onSubmit={handleRequestSalary} className="space-y-4">
          <Input label="Month & Year" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} placeholder="e.g. July 2026" required />
          <Input label="Reason / Note" value={salaryReason} onChange={(e) => setSalaryReason(e.target.value)} placeholder="For banking / official process" />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setSalaryModalOpen(false)}>Cancel</Button>
            <Button type="submit">Send Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

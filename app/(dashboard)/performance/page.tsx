"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Award, Star, TrendingUp, CheckCircle2, Edit2, Download, Target } from "lucide-react";
import { Employee } from "@/types";
import { exportToCSV } from "@/lib/export";

interface KRAReview {
  employeeId: string;
  rating: number;
  attendance: number;
  taskVelocity: number;
  kraStatus: "Exceeded" | "Met" | "Below Target";
  managerNotes: string;
}

export default function PerformancePage() {
  const { employees, tasks, updateEmployee } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [reviewingEmp, setReviewingEmp] = useState<Employee | null>(null);

  // Review Form State
  const [rating, setRating] = useState("4.5");
  const [attendance, setAttendance] = useState("98");
  const [taskVelocity, setTaskVelocity] = useState("92");
  const [kraStatus, setKraStatus] = useState<any>("Met");
  const [managerNotes, setManagerNotes] = useState("");

  const openReviewModal = (emp: Employee) => {
    setReviewingEmp(emp);
    setRating(String(emp.monthlyRating));
    setAttendance("98");
    setTaskVelocity("92");
    setKraStatus("Met");
    setManagerNotes("");
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingEmp) return;
    updateEmployee(reviewingEmp.id, { monthlyRating: Number(rating) });
    setReviewingEmp(null);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === "ALL" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const getCompletedTasks = (empName: string) =>
    tasks.filter((t) => t.assignedTo === empName && t.status === "Completed").length;

  const getRatingColor = (r: number) => {
    if (r >= 4.5) return "text-emerald-600";
    if (r >= 3.5) return "text-amber-600";
    return "text-rose-600";
  };

  const getRatingLabel = (r: number) => {
    if (r >= 4.5) return "Exceptional";
    if (r >= 4.0) return "Exceeds Target";
    if (r >= 3.5) return "Meets Target";
    return "Below Target";
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Performance Engine</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">KRA Matrix & Employee Reviews ({filteredEmployees.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Monthly ratings, project completion efficiency, and manager reviews across Memoire.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => exportToCSV("Memoire_Performance", filteredEmployees.map((e) => ({
              Name: e.name, Department: e.department, Designation: e.designation,
              Rating: e.monthlyRating, Tasks: getCompletedTasks(e.name),
            })))}>
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Performance Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#F26722]">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Team Average Rating</span>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {(employees.reduce((a, e) => a + e.monthlyRating, 0) / (employees.length || 1)).toFixed(1)}
              </p>
              <p className="text-xs text-[#F26722] font-semibold mt-1">Out of 5.0</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Top Performers</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {employees.filter((e) => e.monthlyRating >= 4.5).length}
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Rating ≥ 4.5</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Total Tasks Done</span>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {tasks.filter((t) => t.status === "Completed").length}
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-1">This Quarter</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Departments</span>
              <p className="text-2xl font-black text-purple-700 mt-1">{departments.length}</p>
              <p className="text-xs text-purple-600 font-semibold mt-1">Active Teams</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={deptFilter}
          onStatusChange={setDeptFilter}
          statusOptions={departments.map((d) => ({ label: d, value: d }))}
          totalCount={filteredEmployees.length}
        />

        {/* Employee Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEmployees.map((emp) => {
            const completedTasks = getCompletedTasks(emp.name);
            return (
              <Card key={emp.id} className="p-5 space-y-4 hover:shadow-md transition-all border-t-4 border-t-[#F26722]">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.name} src={emp.avatar} size="lg" />
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{emp.name}</h3>
                      <p className="text-xs text-gray-500">{emp.designation}</p>
                      <Badge variant="orange" className="mt-1">{emp.department}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium block">Monthly Rating</span>
                    <p className={`text-2xl font-black flex items-center gap-1 mt-0.5 ${getRatingColor(emp.monthlyRating)}`}>
                      <Star className="w-5 h-5 fill-current" />
                      {emp.monthlyRating}
                    </p>
                    <span className={`text-[11px] font-bold ${getRatingColor(emp.monthlyRating)}`}>
                      {getRatingLabel(emp.monthlyRating)}
                    </span>
                  </div>
                </div>

                {/* Star Rating Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Performance Score</span>
                    <span className={getRatingColor(emp.monthlyRating)}>{((emp.monthlyRating / 5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${emp.monthlyRating >= 4.5 ? "bg-emerald-500" : emp.monthlyRating >= 3.5 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${(emp.monthlyRating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* KPI Stats */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block">Attendance</span>
                    <p className="font-bold text-gray-900 mt-0.5">98%</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block">Tasks Done</span>
                    <p className="font-bold text-emerald-600 mt-0.5">{completedTasks}</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block">KRA Status</span>
                    <p className="font-bold text-[#F26722] mt-0.5">
                      {emp.monthlyRating >= 4.5 ? "Exceeded" : emp.monthlyRating >= 3.5 ? "Met" : "Below"}
                    </p>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">Joined: {emp.joiningDate}</p>
                  <Button size="sm" variant="outline" onClick={() => openReviewModal(emp)}>
                    <Edit2 className="w-3.5 h-3.5" /> Update Rating
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Review / Edit Modal */}
        {reviewingEmp && (
          <Modal
            isOpen={!!reviewingEmp}
            onClose={() => setReviewingEmp(null)}
            title={`Review — ${reviewingEmp.name}`}
            description={`${reviewingEmp.designation} • ${reviewingEmp.department}`}
          >
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <Avatar name={reviewingEmp.name} src={reviewingEmp.avatar} size="lg" />
                <div>
                  <h4 className="font-bold text-gray-900">{reviewingEmp.name}</h4>
                  <p className="text-xs text-gray-500">{reviewingEmp.designation} • {reviewingEmp.department}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Current Rating: {reviewingEmp.monthlyRating}/5.0</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Monthly Rating (1–5)" type="number" value={rating} onChange={(e) => setRating(e.target.value)} min="1" max="5" step="0.1" required />
                <Input label="Attendance %" type="number" value={attendance} onChange={(e) => setAttendance(e.target.value)} min="0" max="100" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Task Velocity %" type="number" value={taskVelocity} onChange={(e) => setTaskVelocity(e.target.value)} min="0" max="100" required />
                <Select
                  label="KRA Achievement"
                  value={kraStatus}
                  onChange={(e) => setKraStatus(e.target.value as any)}
                  options={[
                    { label: "Exceeded Target", value: "Exceeded" },
                    { label: "Met Target", value: "Met" },
                    { label: "Below Target", value: "Below Target" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Manager Notes</label>
                <textarea
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F26722] resize-none"
                  rows={3}
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Provide qualitative feedback on performance..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setReviewingEmp(null)}>Cancel</Button>
                <Button type="submit">Save Review</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

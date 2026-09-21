"use client";

import React, { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import {
  buildOfferLetterHTML,
  buildEmployeeIDCardHTML,
  buildSalarySlipHTML,
  printDocument,
  downloadDocument,
} from "@/lib/export";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  ArrowLeft,
  Calendar,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  CheckSquare,
  Layers,
  Plus,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CreditCard,
  UserCheck,
} from "lucide-react";

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const {
    isHydrated,
    employees,
    attendance,
    leaves,
    tasks,
    projects,
    workReports,
    documents,
    uploadDocument,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState("overview");

  // Offer Letter Generation Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerCtc, setOfferCtc] = useState("960000");
  const [offerProbation, setOfferProbation] = useState("3");
  const [offerNotice, setOfferNotice] = useState("30");
  const [offerJoiningDate, setOfferJoiningDate] = useState("");
  const [offerSavedSuccess, setOfferSavedSuccess] = useState(false);

  // Payslip Generation Modal State
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payMonth, setPayMonth] = useState("September");
  const [payYear, setPayYear] = useState("2026");

  // Document Upload Modal State
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("Offer Letter");

  // Prevent SSR/client hydration mismatch by rendering a clean matching shell until mounted
  if (!mounted) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 h-36"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 h-16"></div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 h-16"></div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 h-16"></div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 h-16"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  const emp = employees.find((e) => e.id === resolvedParams.id);

  if (!emp) {
    return (
      <AppShell>
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto my-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Employee Profile Not Found</h2>
          <p className="text-xs text-gray-500">
            The requested team member does not exist or was removed from the database directory.
          </p>
          <Button onClick={() => (window.location.href = "/hr")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to HR Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  // Related entity records filtered for this employee
  const empAttendance = attendance.filter(
    (a) => a.employeeId === emp.id || a.employeeName.toLowerCase() === emp.name.toLowerCase()
  );
  const empLeaves = leaves.filter(
    (l) => l.employeeId === emp.id || l.employeeName.toLowerCase() === emp.name.toLowerCase()
  );
  const empTasks = tasks.filter((t) => t.assignedTo.toLowerCase() === emp.name.toLowerCase());
  const empProjects = projects.filter(
    (p) => p.projectManager === emp.name || p.team.includes(emp.name)
  );
  const empReports = workReports.filter(
    (w) => w.employeeId === emp.id || w.employeeName.toLowerCase() === emp.name.toLowerCase()
  );
  const empDocs = documents.filter(
    (d) => d.uploadedBy.toLowerCase() === emp.name.toLowerCase() || d.name.toLowerCase().includes(emp.name.toLowerCase())
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "employment", label: "Employment & Role" },
    { id: "attendance", label: "Attendance Log", count: empAttendance.length },
    { id: "leave", label: "Leave History", count: empLeaves.length },
    { id: "tasks", label: "Assigned Tasks", count: empTasks.length },
    { id: "projects", label: "Projects", count: empProjects.length },
    { id: "performance", label: "Performance" },
    { id: "salary", label: "Salary & CTC" },
    { id: "documents", label: "Documents", count: empDocs.length },
    { id: "reports", label: "Work Reports", count: empReports.length },
  ];

  // Actions: Offer Letter
  const openOfferLetterModal = () => {
    setOfferCtc(String(emp.salary?.annualCtc || 960000));
    setOfferJoiningDate(emp.joiningDate || new Date().toISOString().split("T")[0]);
    setOfferSavedSuccess(false);
    setOfferModalOpen(true);
  };

  const getOfferHTML = () => {
    return buildOfferLetterHTML({
      employee: emp,
      annualCtc: Number(offerCtc) || 960000,
      probationMonths: Number(offerProbation) || 3,
      noticePeriodDays: Number(offerNotice) || 30,
      joiningDate: offerJoiningDate,
      reportingManager: emp.reportingManager,
    });
  };

  const handlePrintOfferLetter = () => {
    const html = getOfferHTML();
    printDocument(html, `Offer_Letter_${emp.name.replace(/\s+/g, "_")}`);
  };

  const handleDownloadOfferLetter = () => {
    const html = getOfferHTML();
    downloadDocument(html, `Offer_Letter_${emp.name.replace(/\s+/g, "_")}`);
  };

  const handleSaveOfferToDocuments = () => {
    uploadDocument({
      name: `Official Offer Letter - ${emp.name}.pdf`,
      category: "Employee Documents",
      size: "184 KB",
      uploadedBy: emp.name,
      tags: ["Offer Letter", "HR", "Official", emp.department],
      fileType: "pdf",
    });
    setOfferSavedSuccess(true);
    setTimeout(() => {
      setOfferSavedSuccess(false);
      setOfferModalOpen(false);
    }, 1500);
  };

  // Actions: Employee ID Card
  const handlePrintIDCard = () => {
    const html = buildEmployeeIDCardHTML(emp);
    printDocument(html, `ID_Card_${emp.employeeId}`);
  };

  // Actions: Salary Slip
  const handlePrintSalarySlip = () => {
    const html = buildSalarySlipHTML(emp, payMonth, Number(payYear) || 2026);
    printDocument(html, `Payslip_${emp.employeeId}_${payMonth}_${payYear}`);
  };

  const handleSaveSalarySlip = () => {
    uploadDocument({
      name: `Payslip - ${payMonth} ${payYear} - ${emp.name}.pdf`,
      category: "Employee Documents",
      size: "142 KB",
      uploadedBy: emp.name,
      tags: ["Salary Slip", payMonth, payYear],
      fileType: "pdf",
    });
    setPayslipModalOpen(false);
  };

  const handleManualUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    uploadDocument({
      name: `${docName} - ${emp.name}`,
      category: "Employee Documents",
      size: "245 KB",
      uploadedBy: emp.name,
      tags: [docCategory, "Employee Dossier", emp.department],
      fileType: "pdf",
    });
    setDocName("");
    setUploadDocModalOpen(false);
  };

  // Salary calculations
  const defaultAnnualCtc = emp.salary?.annualCtc || 960000;
  const monthlyGross = Math.round(defaultAnnualCtc / 12);
  const basicSalary = emp.salary?.basic || Math.round(monthlyGross * 0.5);
  const hra = emp.salary?.hra || Math.round(monthlyGross * 0.3);
  const specialAllowance = emp.salary?.specialAllowance || (monthlyGross - basicSalary - hra);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => (window.location.href = "/hr")}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to HR Directory
        </button>

        {/* Profile Card Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={emp.name} src={emp.avatar} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">{emp.name}</h1>
                <Badge variant="orange">{emp.employeeId}</Badge>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {emp.employmentStatus}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#F26722] mt-0.5">
                {emp.designation} • {emp.department}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {emp.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {emp.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {emp.workLocation}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintIDCard}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 font-bold"
            >
              <CreditCard className="w-4 h-4 mr-1.5 text-indigo-600" /> Print ID Badge
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openOfferLetterModal}
              className="border-orange-200 text-[#F26722] hover:bg-orange-50 font-bold"
            >
              <FileText className="w-4 h-4 mr-1.5" /> Offer Letter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayslipModalOpen(true)}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Payslip
            </Button>
            <Button size="sm" onClick={() => setUploadDocModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Upload File
            </Button>
          </div>
        </div>

        {/* High-Level Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-xs">
          <div>
            <span className="text-gray-400 font-medium">Reporting Authority</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{emp.reportingManager}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Date of Joining</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{emp.joiningDate}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Assigned Tasks</span>
            <p className="text-sm font-black text-gray-900 mt-0.5">{empTasks.length} Tasks</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Leave Balance Total</span>
            <p className="text-sm font-black text-emerald-600 mt-0.5">
              {(emp.leaveBalance?.casual || 0) + (emp.leaveBalance?.sick || 0) + (emp.leaveBalance?.earned || 0)} Days
            </p>
          </div>
        </div>

        {/* 10 Sub-Tabs Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase text-gray-900 tracking-wider">
                  Leave Balance Register
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100">
                    <span className="text-xs font-bold text-gray-500">Casual Leave</span>
                    <p className="text-2xl font-black text-[#F26722] mt-1">
                      {emp.leaveBalance?.casual ?? 12} Days
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-xs font-bold text-gray-500">Sick Leave</span>
                    <p className="text-2xl font-black text-blue-600 mt-1">
                      {emp.leaveBalance?.sick ?? 10} Days
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-xs font-bold text-gray-500">Earned Leave</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {emp.leaveBalance?.earned ?? 15} Days
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-bold uppercase text-gray-900 tracking-wider mb-3">
                  Core Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {emp.skills && emp.skills.length > 0 ? (
                    emp.skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold"
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No skill tags listed yet.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Current Active Tasks Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle>Current Assigned Deliverables ({empTasks.length})</CardTitle>
                <CardDescription>Active sprint responsibilities and task deadlines</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {empTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No active tasks assigned to {emp.name} at this time.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 text-xs">
                    {empTasks.slice(0, 5).map((t) => (
                      <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{t.title}</p>
                          <p className="text-gray-500 mt-0.5">
                            {t.projectName} • Due {t.dueDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                            {t.priority}
                          </span>
                          <Badge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: EMPLOYMENT & ROLE */}
        {activeTab === "employment" && (
          <Card className="p-6 space-y-6">
            <h3 className="text-base font-bold text-gray-900">Employment Details & Placement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Employee Identification</span>
                <p className="text-sm font-bold text-gray-900 mt-1 font-mono">{emp.employeeId}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Designation</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{emp.designation}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Department</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{emp.department}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Reporting Authority</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{emp.reportingManager}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Date of Joining</span>
                <p className="text-sm font-bold text-gray-900 mt-1">{emp.joiningDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Work Mode & Station</span>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {emp.workLocation} ({emp.employmentStatus})
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Residential Address</span>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {emp.address ? `${emp.address}, ${emp.city || ""} ${emp.pincode || ""}` : "Navi Mumbai, Maharashtra"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Emergency Contact</span>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {emp.emergencyContact ? `${emp.emergencyContact.name} (${emp.emergencyContact.relationship}) • ${emp.emergencyContact.phone}` : emp.phone}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium">Blood Group</span>
                <p className="text-sm font-bold text-rose-600 mt-1">{emp.bloodGroup || "O+"}</p>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 3: ATTENDANCE LOG */}
        {activeTab === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log & Punch Register ({empAttendance.length})</CardTitle>
              <CardDescription>Daily punch-in, punch-out, and verified office hours</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {empAttendance.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No attendance punches recorded yet for this team member.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Punch In</th>
                        <th className="px-6 py-3">Punch Out</th>
                        <th className="px-6 py-3">Working Hours</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                      {empAttendance.map((rec) => (
                        <tr key={rec.id} className="hover:bg-gray-50/80">
                          <td className="px-6 py-3.5 font-bold">{rec.date}</td>
                          <td className="px-6 py-3.5 font-mono text-emerald-600">{rec.punchInTime}</td>
                          <td className="px-6 py-3.5 font-mono text-gray-500">{rec.punchOutTime || "--"}</td>
                          <td className="px-6 py-3.5">{rec.workingHours}</td>
                          <td className="px-6 py-3.5 text-gray-500">{rec.location}</td>
                          <td className="px-6 py-3.5"><Badge status={rec.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 4: LEAVE HISTORY */}
        {activeTab === "leave" && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Application Register ({empLeaves.length})</CardTitle>
              <CardDescription>Leave requests, approvals, and balance history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {empLeaves.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No leave applications submitted by {emp.name}.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {empLeaves.map((l) => (
                    <div key={l.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{l.leaveType}</span>
                          <Badge status={l.status} />
                        </div>
                        <p className="text-gray-500 mt-1">
                          {l.startDate} to {l.endDate} • Applied on {l.appliedOn}
                        </p>
                        <p className="text-gray-600 mt-1 italic">"{l.reason}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 5: TASKS */}
        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle>Sprint & Milestone Tasks ({empTasks.length})</CardTitle>
              <CardDescription>Assigned project deliverables and checklists</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {empTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No tasks currently assigned to this team member.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {empTasks.map((t) => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-900">{t.title}</p>
                        <p className="text-gray-500 mt-0.5">
                          Project: {t.projectName} • Due {t.dueDate} • Est: {t.estimatedHours}h
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          {t.priority}
                        </span>
                        <Badge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 6: PROJECTS */}
        {activeTab === "projects" && (
          <Card>
            <CardHeader>
              <CardTitle>Engaged Client Projects ({empProjects.length})</CardTitle>
              <CardDescription>Active and delivered campaign scopes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {empProjects.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Not currently tagged on any active projects.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {empProjects.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-gray-500 mt-0.5">
                          Client: {p.clientName} • Category: {p.serviceCategory} • PM: {p.projectManager}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-emerald-600">{p.progress}%</span>
                        <Badge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 7: PERFORMANCE */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-gray-900 tracking-wider">
                Overall KPI Rating
              </h3>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <Award className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-emerald-700">{emp.monthlyRating} / 5.0</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">High Performance Tier</p>
              </div>
            </Card>

            <Card className="md:col-span-2 p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-gray-900 tracking-wider">
                Monthly Performance Assessment
              </h3>
              <div className="space-y-3 text-xs text-gray-600">
                <p className="p-4 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">
                  Consistently meets client creative delivery targets. Excellent collaboration across
                  the {emp.department} team with strong reliability in meeting sprint milestones.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-medium">Sprint Completion Rate</span>
                    <p className="text-base font-black text-gray-900 mt-0.5">94.8%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-medium">Client Revision Average</span>
                    <p className="text-base font-black text-emerald-600 mt-0.5">1.2 Cycles</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 8: SALARY & CTC */}
        {activeTab === "salary" && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Salary Structure & Compensation</h3>
                <p className="text-xs text-gray-500 mt-0.5">Annual CTC breakdown and monthly take-home register</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPayslipModalOpen(true)}>
                  <Printer className="w-4 h-4 mr-1.5" /> Generate Payslip
                </Button>
                <Button size="sm" variant="outline" onClick={openOfferLetterModal}>
                  <FileText className="w-4 h-4 mr-1.5" /> Offer / CTC Letter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100">
                <span className="text-xs font-bold text-gray-500 uppercase">Annual CTC</span>
                <p className="text-2xl font-black text-[#F26722] mt-1">{formatINR(defaultAnnualCtc)}</p>
                <p className="text-xs text-gray-500 mt-1">Per Annum Cost to Company</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase">Monthly Gross</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{formatINR(monthlyGross)}</p>
                <p className="text-xs text-gray-500 mt-1">Pre-tax monthly earnings</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-bold text-gray-500 uppercase">Basic Component</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(basicSalary)}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">50% Basic Allocation</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Salary Component</th>
                  <th className="px-6 py-3 text-right">Monthly (INR)</th>
                  <th className="px-6 py-3 text-right">Annual (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                <tr>
                  <td className="px-6 py-3.5">Basic Salary (50%)</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(basicSalary)}</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(basicSalary * 12)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">House Rent Allowance (HRA - 30%)</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(hra)}</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(hra * 12)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">Special & Performance Allowance</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(specialAllowance)}</td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatINR(specialAllowance * 12)}</td>
                </tr>
                <tr className="bg-orange-50/50 font-bold text-gray-900">
                  <td className="px-6 py-3.5 text-[#F26722]">Total Cost to Company (CTC)</td>
                  <td className="px-6 py-3.5 text-right font-mono text-[#F26722]">{formatINR(monthlyGross)}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-[#F26722]">{formatINR(defaultAnnualCtc)}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}

        {/* TAB 9: DOCUMENTS */}
        {activeTab === "documents" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Document Dossier ({empDocs.length})</CardTitle>
                <CardDescription>Official offer letters, agreements, resumes, and ID records</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handlePrintIDCard}>
                  <CreditCard className="w-3.5 h-3.5 mr-1" /> ID Badge
                </Button>
                <Button size="sm" onClick={() => setUploadDocModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {empDocs.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">No documents stored</p>
                  <p className="mt-0.5">Generate an Offer Letter, Payslip, or upload candidate credentials.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {empDocs.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26722] border border-orange-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{doc.name}</p>
                          <p className="text-gray-400 mt-0.5">
                            {doc.category} • {doc.size} • Uploaded {doc.uploadedDate}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert(`Document "${doc.name}" is verified and ready for download.`)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 10: WORK REPORTS */}
        {activeTab === "reports" && (
          <Card>
            <CardHeader>
              <CardTitle>Daily & Weekly Work Reports ({empReports.length})</CardTitle>
              <CardDescription>Submitted timesheets and milestone accomplishments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {empReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No work reports filed by this team member yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {empReports.map((r) => (
                    <div key={r.id} className="p-4 hover:bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{r.type} Work Report</span>
                          <span className="font-mono text-gray-500">({r.date})</span>
                        </div>
                        <Badge status={r.status} />
                      </div>
                      <p className="text-gray-700"><strong>Accomplishments:</strong> {r.achievements}</p>
                      <p className="text-gray-500"><strong>Hours Logged:</strong> {r.hoursWorked} hrs</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============================================================================== */}
        {/* OFFER LETTER GENERATOR MODAL */}
        {/* ============================================================================== */}
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title={`Generate Offer Letter — ${emp.name}`}
          description="Prepare and export an official letter of employment using employee data."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Annual CTC (INR)"
                type="number"
                value={offerCtc}
                onChange={(e) => setOfferCtc(e.target.value)}
                required
              />
              <Input
                label="Date of Joining"
                type="date"
                value={offerJoiningDate}
                onChange={(e) => setOfferJoiningDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Probation Period (Months)"
                type="number"
                value={offerProbation}
                onChange={(e) => setOfferProbation(e.target.value)}
              />
              <Input
                label="Notice Period (Days)"
                type="number"
                value={offerNotice}
                onChange={(e) => setOfferNotice(e.target.value)}
              />
            </div>

            <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-gray-700 space-y-1">
              <p><strong>Candidate:</strong> {emp.name}</p>
              <p><strong>Designation:</strong> {emp.designation} ({emp.department})</p>
              <p><strong>Reporting Authority:</strong> {emp.reportingManager}</p>
              <p><strong>Work Station:</strong> {emp.workLocation} ({emp.employmentStatus})</p>
            </div>

            {offerSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Offer letter generated and saved to Employee Documents!
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleDownloadOfferLetter}>
                <Download className="w-4 h-4 mr-1.5" /> Download HTML
              </Button>
              <Button onClick={handlePrintOfferLetter}>
                <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
              </Button>
              <Button
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                onClick={handleSaveOfferToDocuments}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Save to Documents
              </Button>
            </div>
          </div>
        </Modal>

        {/* ============================================================================== */}
        {/* PAYSLIP GENERATOR MODAL */}
        {/* ============================================================================== */}
        <Modal
          isOpen={payslipModalOpen}
          onClose={() => setPayslipModalOpen(false)}
          title={`Generate Salary Slip — ${emp.name}`}
          description="Prepare monthly earnings and deduction statement"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Pay Period Month"
                value={payMonth}
                onChange={(e) => setPayMonth(e.target.value)}
                options={[
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ]}
              />
              <Input
                label="Fiscal Year"
                type="number"
                value={payYear}
                onChange={(e) => setPayYear(e.target.value)}
                required
              />
            </div>

            <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-gray-700 space-y-1.5">
              <p><strong>Employee:</strong> {emp.name} ({emp.employeeId})</p>
              <p><strong>Gross Monthly Pay:</strong> {formatINR(monthlyGross)}</p>
              <p><strong>Estimated Net Take-Home:</strong> {formatINR(monthlyGross - 2000)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setPayslipModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrintSalarySlip}>
                <Printer className="w-4 h-4 mr-1.5" /> Print Payslip
              </Button>
              <Button
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                onClick={handleSaveSalarySlip}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Save to Documents
              </Button>
            </div>
          </div>
        </Modal>

        {/* ============================================================================== */}
        {/* MANUAL DOCUMENT UPLOAD MODAL */}
        {/* ============================================================================== */}
        <Modal
          isOpen={uploadDocModalOpen}
          onClose={() => setUploadDocModalOpen(false)}
          title={`Upload Employee Document — ${emp.name}`}
          description="Register verification records, agreements, or certifications"
        >
          <form onSubmit={handleManualUploadDoc} className="space-y-4">
            <Input
              label="Document Title"
              placeholder="e.g. Identity Proof (PAN / Aadhaar), Degree Certificate"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              required
            />
            <Select
              label="Document Category"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              options={[
                { label: "Offer Letter", value: "Offer Letter" },
                { label: "Appointment Letter", value: "Appointment Letter" },
                { label: "Salary Slip", value: "Salary Slip" },
                { label: "ID Proof", value: "ID Proof" },
                { label: "Resume / CV", value: "Resume" },
                { label: "Experience Letter", value: "Experience Letter" },
                { label: "Other", value: "Other" },
              ]}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setUploadDocModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload & Save</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { Modal } from "../ui/modal";
import { Input, Select } from "../ui/input";
import { FilterBar } from "../ui/filter-bar";
import { ActionMenu } from "../ui/action-menu";
import { Tabs } from "../ui/tabs";
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Megaphone,
  Plus,
  Download,
  Edit2,
  UserCheck,
  Shield,
  CreditCard,
  Phone,
  FileText,
} from "lucide-react";
import { Employee, UserRole } from "@/types";
import { exportToCSV } from "@/lib/export";
import { formatINR } from "@/lib/utils";

export function HRDashboard() {
  const {
    employees,
    attendance,
    leaves,
    reviewLeave,
    salaryRequests,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [formTab, setFormTab] = useState("personal");

  // Form State: 1. Personal & Contact
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [dob, setDob] = useState("1998-05-15");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Navi Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400703");

  // Form State: 2. Employment & Role
  const [employeeId, setEmployeeId] = useState("");
  const [dept, setDept] = useState<any>("Creative & Brand");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [reportingManager, setReportingManager] = useState("Founder & Managing Director");
  const [joiningDate, setJoiningDate] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState<"Full-Time" | "Probation" | "Contract" | "Intern">("Full-Time");
  const [workLocation, setWorkLocation] = useState<"Navi Mumbai Office" | "Remote" | "Hybrid">("Navi Mumbai Office");

  // Form State: 3. Compensation & Bank
  const [annualCtc, setAnnualCtc] = useState("960000");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("HDFC0001024");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  // Form State: 4. Emergency Contacts & Leaves
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRel, setEmergencyRel] = useState("Parent / Spouse");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [casualLeave, setCasualLeave] = useState("12");
  const [sickLeave, setSickLeave] = useState("10");
  const [earnedLeave, setEarnedLeave] = useState("15");

  const openCreateModal = () => {
    setEditEmp(null);
    const count = String(employees.length + 1).padStart(3, "0");
    const autoId = `MEM-EMP-${new Date().getFullYear()}-${count}`;
    setEmployeeId(autoId);
    setName("");
    setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
    setEmail("");
    setPhone("+91 ");
    setAlternatePhone("");
    setDob("1998-05-15");
    setGender("Male");
    setBloodGroup("O+");
    setAddress("Palm Beach Road, Sector 19");
    setCity("Navi Mumbai");
    setState("Maharashtra");
    setPincode("400703");
    setDept("Creative & Brand");
    setDesignation("Brand Strategist");
    setRole("EMPLOYEE");
    setReportingManager(employees[0]?.name || "Founder & Managing Director");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setEmploymentStatus("Full-Time");
    setWorkLocation("Navi Mumbai Office");
    setAnnualCtc("960000");
    setBankName("HDFC Bank");
    setAccountNumber("");
    setIfsc("HDFC0001024");
    setPan("AABCM8920C");
    setAadhaar("");
    setEmergencyName("");
    setEmergencyRel("Parent / Spouse");
    setEmergencyPhone("");
    setCasualLeave("12");
    setSickLeave("10");
    setEarnedLeave("15");
    setFormTab("personal");
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditEmp(emp);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setAvatar(emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
    setEmail(emp.email);
    setPhone(emp.phone);
    setAlternatePhone(emp.alternatePhone || "");
    setDob(emp.dob || "1998-05-15");
    setGender((emp.gender as any) || "Male");
    setBloodGroup(emp.bloodGroup || "O+");
    setAddress(emp.address || "");
    setCity(emp.city || "Navi Mumbai");
    setState(emp.state || "Maharashtra");
    setPincode(emp.pincode || "400703");
    setDept(emp.department);
    setDesignation(emp.designation);
    setRole(emp.role || "EMPLOYEE");
    setReportingManager(emp.reportingManager);
    setJoiningDate(emp.joiningDate);
    setEmploymentStatus(emp.employmentStatus as any);
    setWorkLocation(emp.workLocation);
    setAnnualCtc(String(emp.salary?.annualCtc || 960000));
    setBankName(emp.bankDetails?.bankName || "HDFC Bank");
    setAccountNumber(emp.bankDetails?.accountNumber || "");
    setIfsc(emp.bankDetails?.ifsc || "HDFC0001024");
    setPan(emp.bankDetails?.pan || "AABCM8920C");
    setAadhaar(emp.bankDetails?.aadhaar || "");
    setEmergencyName(emp.emergencyContact?.name || "");
    setEmergencyRel(emp.emergencyContact?.relationship || "Parent / Spouse");
    setEmergencyPhone(emp.emergencyContact?.phone || "");
    setCasualLeave(String(emp.leaveBalance?.casual || 12));
    setSickLeave(String(emp.leaveBalance?.sick || 10));
    setEarnedLeave(String(emp.leaveBalance?.earned || 15));
    setFormTab("personal");
    setModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const ctc = Number(annualCtc) || 960000;
    const monthlyGross = Math.round(ctc / 12);
    const basic = Math.round(monthlyGross * 0.5);
    const hra = Math.round(monthlyGross * 0.3);
    const specialAllowance = monthlyGross - basic - hra;

    const empPayload = {
      name,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      email,
      phone,
      alternatePhone,
      dob,
      gender,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      emergencyContact: {
        name: emergencyName || "Immediate Family",
        relationship: emergencyRel,
        phone: emergencyPhone || phone,
      },
      department: dept,
      designation: designation || "Specialist",
      role,
      reportingManager,
      joiningDate: joiningDate || new Date().toISOString().split("T")[0],
      employmentStatus,
      workLocation,
      skills: ["Brand Strategy", "Campaign Execution", dept],
      leaveBalance: {
        casual: Number(casualLeave) || 12,
        sick: Number(sickLeave) || 10,
        earned: Number(earnedLeave) || 15,
      },
      salary: {
        annualCtc: ctc,
        monthlyGross,
        basic,
        hra,
        specialAllowance,
      },
      bankDetails: {
        bankName,
        accountNumber,
        ifsc,
        pan,
        aadhaar,
      },
      loginCredentials: {
        username: email.split("@")[0],
        status: "Active" as const,
      },
    };

    if (editEmp) {
      updateEmployee(editEmp.id, empPayload);
    } else {
      addEmployee({
        ...empPayload,
        employeeId: employeeId || `MEM-EMP-${new Date().getFullYear()}-001`,
      });
    }
    setModalOpen(false);
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const presentToday = attendance.filter((a) => a.status === "Present" || a.status === "Late").length;

  const filteredEmployees = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.employeeId && e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDept = deptFilter === "ALL" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = ["ALL", "Creative & Brand", "Digital Marketing", "Technology", "BDM & Sales", "HR & Ops", "Finance"];

  const handleExport = () => {
    exportToCSV(
      "Memoire_Employee_Directory",
      filteredEmployees.map((e) => ({
        "Employee ID": e.employeeId,
        Name: e.name,
        Email: e.email,
        Phone: e.phone,
        Department: e.department,
        Designation: e.designation,
        "Work Location": e.workLocation,
        "Joining Date": e.joiningDate,
        "Annual CTC": e.salary?.annualCtc ? formatINR(e.salary.annualCtc) : "₹9,60,000",
      }))
    );
  };

  const formTabs = [
    { id: "personal", label: "1. Personal & Contact" },
    { id: "employment", label: "2. Employment & Role" },
    { id: "salary", label: "3. Salary & Bank" },
    { id: "emergency", label: "4. Emergency & Leaves" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">HR Management</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Human Resources Hub ({filteredEmployees.length} Employees)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Team directory, attendance records, leave approvals, and employee profile documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Employee
          </Button>
        </div>
      </div>

      {/* HR Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Total Workforce</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{employees.length}</p>
            <p className="text-xs text-gray-500 mt-1">Full-Time & Probation</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Present Today</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {presentToday} / {employees.length || 0}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Navi Mumbai Office</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Pending Leaves</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{pendingLeaves.length}</p>
            <p className="text-xs text-amber-600 font-semibold mt-1">Requires Review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Salary Slip Requests</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{salaryRequests.length}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">Ready for Dispatch</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={deptFilter}
        onStatusChange={setDeptFilter}
        statusOptions={departments.map((d) => ({ label: d, value: d }))}
        totalCount={filteredEmployees.length}
      />

      {/* Employee Directory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Emp ID</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Work Location</th>
                  <th className="px-6 py-3.5">Leave Balance</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Avatar name={emp.name} src={emp.avatar} size="sm" />
                      <div>
                        <p className="font-bold text-gray-900">{emp.name}</p>
                        <p className="text-[11px] text-gray-400">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">{emp.employeeId}</td>
                    <td className="px-6 py-4">{emp.department}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{emp.designation}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {emp.workLocation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      CL: {emp.leaveBalance.casual} | SL: {emp.leaveBalance.sick} | EL: {emp.leaveBalance.earned}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => (window.location.href = `/hr/employees/${emp.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#F26722] hover:bg-orange-100 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        <ActionMenu
                          onEdit={() => openEditModal(emp)}
                          onDelete={() => deleteEmployee(emp.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-900 text-sm">No employees registered</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Click "Add Employee" above to onboard your first team member.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================================== */}
      {/* FULL PRODUCTION EMPLOYEE ONBOARDING MODAL */}
      {/* ============================================================================== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editEmp ? `Edit Profile — ${editEmp.name}` : "Onboard New Employee"}
        description={
          editEmp
            ? "Update full personal, employment, and payroll specifications"
            : "Complete professional registration for Memoire OS workforce"
        }
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          {/* Sub-tabs inside Onboarding Modal */}
          <Tabs tabs={formTabs} activeTab={formTab} onChange={setFormTab} variant="pills" />

          {/* TAB 1: PERSONAL & CONTACT */}
          {formTab === "personal" && (
            <div className="space-y-3 pt-2">
              <Input
                label="Full Name"
                placeholder="e.g. Vikram Malhotra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Profile Photo URL"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Official Email"
                  type="email"
                  placeholder="vikram@memoire.co.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Primary Phone"
                  placeholder="+91 98200 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Alternate Phone"
                  placeholder="+91 98200 99887"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <Select
                  label="Blood Group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  options={[
                    { label: "O+", value: "O+" },
                    { label: "O-", value: "O-" },
                    { label: "A+", value: "A+" },
                    { label: "A-", value: "A-" },
                    { label: "B+", value: "B+" },
                    { label: "B-", value: "B-" },
                    { label: "AB+", value: "AB+" },
                    { label: "AB-", value: "AB-" },
                  ]}
                />
              </div>
              <Input
                label="Residential Address"
                placeholder="Flat / Building, Street, Area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
                <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYMENT & ROLE */}
          {formTab === "employment" && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Employee ID (Auto-Generated)"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
                <Select
                  label="Department"
                  value={dept}
                  onChange={(e) => setDept(e.target.value as any)}
                  options={[
                    { label: "Creative & Brand", value: "Creative & Brand" },
                    { label: "Digital Marketing", value: "Digital Marketing" },
                    { label: "Technology", value: "Technology" },
                    { label: "BDM & Sales", value: "BDM & Sales" },
                    { label: "HR & Ops", value: "HR & Ops" },
                    { label: "Finance", value: "Finance" },
                    { label: "Management", value: "Management" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Designation"
                  placeholder="e.g. Senior Brand Designer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
                <Select
                  label="System Role & Permissions"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  options={[
                    { label: "Employee / Specialist", value: "EMPLOYEE" },
                    { label: "Project Manager", value: "PROJECT_MANAGER" },
                    { label: "Team Lead", value: "TEAM_LEAD" },
                    { label: "BDM / Sales Lead", value: "BDM" },
                    { label: "Account Manager", value: "ACCOUNT_MANAGER" },
                    { label: "Head of HR", value: "HR" },
                    { label: "Finance & Accounts", value: "FINANCE" },
                    { label: "Master Admin", value: "MASTER_ADMIN" },
                    { label: "Founder & CEO", value: "FOUNDER" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Joining Date"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                />
                <Select
                  label="Employment Type"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as any)}
                  options={[
                    { label: "Full-Time", value: "Full-Time" },
                    { label: "Probation (3 Months)", value: "Probation" },
                    { label: "Contractual", value: "Contract" },
                    { label: "Graduate Intern", value: "Intern" },
                  ]}
                />
                <Select
                  label="Work Station"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value as any)}
                  options={[
                    { label: "Navi Mumbai Office", value: "Navi Mumbai Office" },
                    { label: "Remote", value: "Remote" },
                    { label: "Hybrid", value: "Hybrid" },
                  ]}
                />
              </div>
              <Input
                label="Reporting Authority / Manager"
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
              />
            </div>
          )}

          {/* TAB 3: SALARY & BANK */}
          {formTab === "salary" && (
            <div className="space-y-3 pt-2">
              <Input
                label="Annual Cost to Company (CTC in INR)"
                type="number"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(e.target.value)}
                required
              />
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-gray-700 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-400 font-medium">Monthly Gross:</span>
                  <p className="font-bold text-gray-900">{formatINR(Math.round(Number(annualCtc || 0) / 12))}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Basic (50%):</span>
                  <p className="font-bold text-gray-900">{formatINR(Math.round((Number(annualCtc || 0) / 12) * 0.5))}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">HRA (30%):</span>
                  <p className="font-bold text-gray-900">{formatINR(Math.round((Number(annualCtc || 0) / 12) * 0.3))}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                <Input
                  label="Bank Account Number"
                  placeholder="e.g. 50200081293812"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Branch IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
                <Input label="PAN Card Number" placeholder="AABCM8920C" value={pan} onChange={(e) => setPan(e.target.value)} />
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY & LEAVES */}
          {formTab === "emergency" && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Emergency Contact Name"
                  placeholder="e.g. Suresh Malhotra"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
                <Input
                  label="Relationship"
                  placeholder="Parent / Spouse / Sibling"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                />
              </div>
              <Input
                label="Emergency Phone Number"
                placeholder="+91 98200 99999"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider pt-2">Annual Leave Entitlements</p>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Casual Leave"
                  type="number"
                  value={casualLeave}
                  onChange={(e) => setCasualLeave(e.target.value)}
                />
                <Input
                  label="Sick Leave"
                  type="number"
                  value={sickLeave}
                  onChange={(e) => setSickLeave(e.target.value)}
                />
                <Input
                  label="Earned Leave"
                  type="number"
                  value={earnedLeave}
                  onChange={(e) => setEarnedLeave(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex gap-1.5 text-xs text-gray-400">
              {formTab !== "personal" && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = formTabs.findIndex((t) => t.id === formTab);
                    if (idx > 0) setFormTab(formTabs[idx - 1].id);
                  }}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  ← Previous Tab
                </button>
              )}
              {formTab !== "emergency" && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = formTabs.findIndex((t) => t.id === formTab);
                    if (idx < formTabs.length - 1) setFormTab(formTabs[idx + 1].id);
                  }}
                  className="px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#F26722] font-semibold cursor-pointer"
                >
                  Next Tab →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editEmp ? "Save Employee Changes" : "Complete Onboarding"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

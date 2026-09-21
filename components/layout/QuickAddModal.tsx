"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Modal } from "../ui/modal";
import { Input, Select } from "../ui/input";
import { Button } from "../ui/button";
import { Briefcase, Building, Layers, CheckSquare, UserPlus, Calendar, FileText, LifeBuoy } from "lucide-react";

export function QuickAddModal() {
  const { quickCreateOpen, setQuickCreateOpen, addLead, addClient, addProject, addTask, addEmployee, createTicket } = useStore();
  const [activeType, setActiveType] = useState<"lead" | "client" | "project" | "task" | "employee" | "ticket">("lead");

  // Lead Form State
  const [leadCompany, setLeadCompany] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadBudget, setLeadBudget] = useState("500000");

  // Task Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("Ananya Iyer");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("High");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === "lead") {
      if (!leadCompany) return;
      addLead({
        companyName: leadCompany,
        contactName: leadContact || "Key Contact",
        email: leadEmail || `info@${leadCompany.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: leadPhone || "+91 98200 00000",
        industry: "Digital & Brand",
        location: "Mumbai",
        source: "Direct Quick Create",
        interestedServices: ["Brand Strategy", "Performance Marketing"],
        budget: Number(leadBudget),
        expectedClosing: "2026-09-01",
        assignedBDM: "Amit Patel",
        leadScore: 80,
        status: "New",
        notes: "Quick created from top action button.",
      });
    } else if (activeType === "task") {
      if (!taskTitle) return;
      addTask({
        title: taskTitle,
        description: "Created via Quick Create action drawer.",
        projectId: "proj-1",
        projectName: "UrbanNest Tower A Launch",
        clientName: "UrbanNest Realty",
        assignedTo: taskAssignedTo,
        assignedBy: "Rahul Sharma",
        priority: taskPriority,
        status: "To Do",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "2026-08-25",
        estimatedHours: 6,
        tags: ["Quick Task"],
      });
    }
    setQuickCreateOpen(false);
  };

  const types = [
    { id: "lead", label: "New Lead", icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
    { id: "task", label: "New Task", icon: <CheckSquare className="w-4 h-4 text-amber-600" /> },
    { id: "project", label: "New Project", icon: <Layers className="w-4 h-4 text-emerald-600" /> },
    { id: "client", label: "New Client", icon: <Building className="w-4 h-4 text-[#F26722]" /> },
    { id: "employee", label: "New Employee", icon: <UserPlus className="w-4 h-4 text-purple-600" /> },
    { id: "ticket", label: "Support Ticket", icon: <LifeBuoy className="w-4 h-4 text-rose-600" /> },
  ];

  return (
    <Modal
      isOpen={quickCreateOpen}
      onClose={() => setQuickCreateOpen(false)}
      title="Universal Quick Create"
      description="Quickly launch entities into MEMOIRE OS"
    >
      <div className="grid grid-cols-3 gap-2 mb-6">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveType(t.id as any)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeType === t.id
                ? "border-[#F26722] bg-orange-50/60 text-gray-900 shadow-xs"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.icon}
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeType === "lead" && (
          <>
            <Input
              label="Company Name"
              placeholder="e.g. Aarav Foods"
              value={leadCompany}
              onChange={(e) => setLeadCompany(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                placeholder="Vikram Malhotra"
                value={leadContact}
                onChange={(e) => setLeadContact(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="vikram@company.in"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
              />
            </div>
            <Input
              label="Estimated Budget (INR)"
              type="number"
              value={leadBudget}
              onChange={(e) => setLeadBudget(e.target.value)}
            />
          </>
        )}

        {activeType === "task" && (
          <>
            <Input
              label="Task Title"
              placeholder="e.g. Finalize Kharghar Tower A Carousel Designs"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Assign To"
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
                options={[
                  { label: "Ananya Iyer (Designer)", value: "Ananya Iyer" },
                  { label: "Vikram Singh (Developer)", value: "Vikram Singh" },
                  { label: "Sneha Kulkarni (Ads)", value: "Sneha Kulkarni" },
                  { label: "Rohan Mehta (PM)", value: "Rohan Mehta" },
                ]}
              />
              <Select
                label="Priority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                options={[
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                  { label: "Urgent", value: "Urgent" },
                ]}
              />
            </div>
          </>
        )}

        {(activeType !== "lead" && activeType !== "task") && (
          <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
            Form initialized for {activeType}. Click submit to generate sample record into state.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={() => setQuickCreateOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create Record</Button>
        </div>
      </form>
    </Modal>
  );
}

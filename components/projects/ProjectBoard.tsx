"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input, Select } from "../ui/input";
import { ActionMenu } from "../ui/action-menu";
import { FilterBar } from "../ui/filter-bar";
import { Layers, Plus, Calendar, User, ShieldCheck } from "lucide-react";

export function ProjectBoard() {
  const { projects, clients, addProject, updateProject, updateProjectStatus, deleteProject } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form State
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState(clients[0]?.companyName || "UrbanNest Realty");
  const [serviceCategory, setServiceCategory] = useState("Brand Strategy");
  const [projectManager, setProjectManager] = useState("Rohan Mehta");
  const [budget, setBudget] = useState("750000");
  const [priority, setPriority] = useState<any>("High");
  const [status, setStatus] = useState<any>("In Progress");
  const [progress, setProgress] = useState("45");

  const openCreateModal = () => {
    setEditingProject(null);
    setName("");
    setModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setClientName(proj.clientName);
    setServiceCategory(proj.serviceCategory);
    setProjectManager(proj.projectManager);
    setBudget(String(proj.budget));
    setPriority(proj.priority);
    setStatus(proj.status);
    setProgress(String(proj.progress));
    setModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const targetClient = clients.find((c) => c.companyName === clientName) || clients[0];

    if (editingProject) {
      updateProject(editingProject.id, {
        name,
        clientName,
        serviceCategory,
        projectManager,
        budget: Number(budget),
        priority,
        status,
        progress: Number(progress),
      });
    } else {
      addProject({
        name,
        clientId: targetClient?.id || "client-1",
        clientName,
        serviceCategory,
        projectManager,
        team: ["Ananya Iyer", "Sneha Kulkarni"],
        startDate: new Date().toISOString().split("T")[0],
        endDate: "2026-10-31",
        budget: Number(budget),
        priority,
        status,
        description: `Agency workspace for ${name}`,
      });
    }
    setModalOpen(false);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operations Hub</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Agency Projects & Workspaces ({filteredProjects.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Client retainers, PM assignments, milestone delivery, and progress bars.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}><Plus className="w-4 h-4" /> Create Project</Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { label: "Planning", value: "Planning" },
          { label: "In Progress", value: "In Progress" },
          { label: "Review", value: "Review" },
          { label: "Client Approval", value: "Client Approval" },
          { label: "Completed", value: "Completed" },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredProjects.length}
      />

      {/* Grid Card View */}
      {viewMode === "grid" ? (
        filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">No projects found</p>
            <p className="text-xs text-gray-400 mt-0.5">Create your first client project or retainer workspace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <Card key={proj.id} className="border-t-4 border-t-[#F26722] hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <span className="text-[11px] font-bold text-[#F26722] uppercase">{proj.clientName}</span>
                    <CardTitle className="mt-1 text-base font-bold text-gray-900">{proj.name}</CardTitle>
                  </div>
                  <ActionMenu
                    onEdit={() => openEditModal(proj)}
                    onDelete={() => deleteProject(proj.id)}
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="orange">{proj.serviceCategory}</Badge>
                    <Badge status={proj.status} />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-700">Project Health Progress</span>
                      <span className="font-black text-gray-900">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#F26722] h-full rounded-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-600" /> PM: {proj.projectManager}</span>
                    <span className="font-black text-gray-900">{formatINR(proj.budget)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Data Table View */
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Project Name</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">PM</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Progress</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{proj.name}</td>
                    <td className="px-6 py-4 font-semibold text-[#F26722]">{proj.clientName}</td>
                    <td className="px-6 py-4">{proj.projectManager}</td>
                    <td className="px-6 py-4 font-black">{formatINR(proj.budget)}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{proj.progress}%</td>
                    <td className="px-6 py-4"><Badge status={proj.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        onEdit={() => openEditModal(proj)}
                        onDelete={() => deleteProject(proj.id)}
                      />
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Layers className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-900 text-sm">No projects found</p>
                        <p className="text-xs text-gray-400 mt-0.5">No project records match the current filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? `Edit ${editingProject.name}` : "Create Agency Project"}
        description="Configure project workspace, budget, and PM assignment"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Client" value={clientName} onChange={(e) => setClientName(e.target.value)} options={clients.map((c) => ({ label: c.companyName, value: c.companyName }))} />
            <Input label="Service Category" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project Manager"
              value={projectManager}
              onChange={(e) => setProjectManager(e.target.value)}
              options={[
                { label: "Rohan Mehta", value: "Rohan Mehta" },
                { label: "Ananya Iyer", value: "Ananya Iyer" },
                { label: "Rahul Sharma", value: "Rahul Sharma" },
              ]}
            />
            <Input label="Project Budget (INR)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
                { label: "Urgent", value: "Urgent" },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { label: "Planning", value: "Planning" },
                { label: "In Progress", value: "In Progress" },
                { label: "Review", value: "Review" },
                { label: "Client Approval", value: "Client Approval" },
                { label: "Completed", value: "Completed" },
              ]}
            />
            <Input label="Progress %" type="number" value={progress} onChange={(e) => setProgress(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingProject ? "Save Changes" : "Create Project"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActionMenu } from "@/components/ui/action-menu";
import { TaskDrawer } from "@/components/projects/TaskDrawer";
import { CheckSquare, Plus, Clock, User, CheckCircle2 } from "lucide-react";

export default function TasksPage() {
  const { tasks, projects, employees, addTask, updateTask, updateTaskStatus, deleteTask, setSelectedTaskId } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState(projects[0]?.name || "UrbanNest Tower A Launch");
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || "Ananya Iyer");
  const [priority, setPriority] = useState<any>("Medium");
  const [status, setStatus] = useState<any>("To Do");
  const [dueDate, setDueDate] = useState("2026-08-25");
  const [estimatedHours, setEstimatedHours] = useState("8");

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setProjectName(task.projectName);
    setAssignedTo(task.assignedTo);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate);
    setEstimatedHours(String(task.estimatedHours));
    setModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const targetProj = projects.find((p) => p.name === projectName) || projects[0];

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        projectName,
        assignedTo,
        priority,
        status,
        dueDate,
        estimatedHours: Number(estimatedHours),
      });
    } else {
      addTask({
        title,
        description,
        projectId: targetProj?.id || "proj-1",
        projectName,
        clientName: targetProj?.clientName || "UrbanNest Realty",
        assignedTo,
        assignedBy: "Rohan Mehta",
        priority,
        status,
        startDate: new Date().toISOString().split("T")[0],
        dueDate,
        estimatedHours: Number(estimatedHours),
        tags: ["Deliverable"],
      });
    }
    setModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deliverable Studio</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Agency Tasks & Deliverables ({filteredTasks.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Task checklists, time logging, employee assignments, and comment streams.
            </p>
          </div>
          <Button size="sm" onClick={openCreateModal}><Plus className="w-4 h-4" /> Create Task</Button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={[
            { label: "To Do", value: "To Do" },
            { label: "In Progress", value: "In Progress" },
            { label: "Review", value: "Review" },
            { label: "Completed", value: "Completed" },
            { label: "Blocked", value: "Blocked" },
          ]}
          categoryFilter={priorityFilter}
          onCategoryChange={setPriorityFilter}
          categoryOptions={[
            { label: "Urgent Priority", value: "Urgent" },
            { label: "High Priority", value: "High" },
            { label: "Medium Priority", value: "Medium" },
          ]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={filteredTasks.length}
        />

        {/* Grid View */}
        {viewMode === "grid" ? (
          filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">No tasks found</p>
              <p className="text-xs text-gray-400 mt-0.5">Create your first task or deliverable for a project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="p-5 space-y-3 border-t-4 border-t-[#F26722] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#F26722] uppercase">{task.projectName}</span>
                    <div className="flex items-center gap-2">
                      <Badge status={task.status} />
                      <ActionMenu
                        onViewDetails={() => setSelectedTaskId(task.id)}
                        onEdit={() => openEditModal(task)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedTaskId(task.id)}
                    className="font-bold text-sm text-gray-900 leading-snug hover:text-[#F26722] cursor-pointer transition-colors"
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{task.description}</p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-600" /> {task.assignedTo}</span>
                    <span className="flex items-center gap-1 font-bold text-gray-700"><Clock className="w-3.5 h-3.5 text-gray-400" /> Due: {task.dueDate}</span>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Table View */
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Task Title</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900 cursor-pointer hover:text-[#F26722]" onClick={() => setSelectedTaskId(task.id)}>
                        {task.title}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#F26722]">{task.projectName}</td>
                      <td className="px-6 py-4">{task.assignedTo}</td>
                      <td className="px-6 py-4 text-gray-500">{task.dueDate}</td>
                      <td className="px-6 py-4"><Badge status={task.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu
                          onViewDetails={() => setSelectedTaskId(task.id)}
                          onEdit={() => openEditModal(task)}
                          onDelete={() => deleteTask(task.id)}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <CheckSquare className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-900 text-sm">No tasks found</p>
                          <p className="text-xs text-gray-400 mt-0.5">No tasks match your current filter.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Create / Edit Task Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTask ? `Edit ${editingTask.title}` : "Create Agency Task"}
          description="Assign task deliverable to employee"
        >
          <form onSubmit={handleSaveTask} className="space-y-4">
            <Input label="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Project" value={projectName} onChange={(e) => setProjectName(e.target.value)} options={projects.map((p) => ({ label: p.name, value: p.name }))} />
              <Select label="Assign To" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} options={employees.map((emp) => ({ label: emp.name, value: emp.name }))} />
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
                  { label: "To Do", value: "To Do" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Review", value: "Review" },
                  { label: "Completed", value: "Completed" },
                  { label: "Blocked", value: "Blocked" },
                ]}
              />
              <Input label="Est. Hours" type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} required />
            </div>
            <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTask ? "Save Task" : "Create Task"}</Button>
            </div>
          </form>
        </Modal>

        {/* Task Detail Drawer */}
        <TaskDrawer />
      </div>
    </AppShell>
  );
}

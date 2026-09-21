"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Drawer } from "../ui/drawer";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { CheckSquare, Clock, User, Calendar, Tag, Send, CheckCircle2 } from "lucide-react";

export function TaskDrawer() {
  const { tasks, selectedTaskId, setSelectedTaskId, toggleTaskChecklist, addTaskComment, updateTaskStatus } = useStore();
  const [commentText, setCommentText] = useState("");

  const task = tasks.find((t) => t.id === selectedTaskId);

  if (!task) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText, "Rahul Sharma");
    setCommentText("");
  };

  return (
    <Drawer
      isOpen={!!selectedTaskId}
      onClose={() => setSelectedTaskId(null)}
      title={task.title}
      description={`${task.projectName} • ${task.clientName}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status & Priority Row */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
            <select
              value={task.status}
              onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#F26722]"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <Badge status={task.priority} />
        </div>

        {/* Task Details Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400">Assigned Specialist</span>
              <p className="font-bold text-gray-900">{task.assignedTo}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400">Due Date</span>
              <p className="font-bold text-gray-900">{task.dueDate}</p>
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</h4>
          <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {task.description}
          </p>
        </div>

        {/* Interactive Subtask Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subtasks Checklist</h4>
          <div className="space-y-2">
            {task.checklist.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 text-xs font-medium cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={c.completed}
                  onChange={() => toggleTaskChecklist(task.id, c.id)}
                  className="w-4 h-4 rounded text-[#F26722] focus:ring-[#F26722] border-gray-300"
                />
                <span className={c.completed ? "line-through text-gray-400" : "text-gray-900 font-semibold"}>
                  {c.text}
                </span>
              </label>
            ))}
            {task.checklist.length === 0 && (
              <p className="text-xs text-gray-400 italic">No checklist items specified.</p>
            )}
          </div>
        </div>

        {/* Comment Stream */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Task Comments & Discussion</h4>
          <div className="space-y-3 mb-4">
            {task.comments.map((cm) => (
              <div key={cm.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{cm.author}</span>
                  <span className="text-[10px] text-gray-400">{cm.createdAt}</span>
                </div>
                <p className="text-gray-700">{cm.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment or update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26722]"
            />
            <Button type="submit" size="sm">
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
}

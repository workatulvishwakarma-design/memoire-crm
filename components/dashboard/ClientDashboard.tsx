"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input, Textarea } from "../ui/input";
import {
  Building,
  CheckCircle2,
  FileText,
  Layers,
  LifeBuoy,
  Clock,
  ThumbsUp,
  RotateCcw,
  Download,
  Printer,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  CheckSquare,
} from "lucide-react";
import { buildInvoiceHTML, buildClientContractHTML, printDocument } from "@/lib/export";

export function ClientDashboard() {
  const {
    role,
    clients,
    projects,
    tasks,
    invoices,
    tickets,
    documents,
    selectedClientId,
    setSelectedClientId,
    updateTaskStatus,
    createTicket,
    addActivity,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionTaskId, setRevisionTaskId] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const [approvedItems, setApprovedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-28 bg-gray-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-2xl"></div>
          <div className="h-64 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Determine active client: strictly isolate data to the selected client
  const activeClient =
    (selectedClientId ? clients.find((c) => c.id === selectedClientId) : null) || clients[0];

  if (!activeClient) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-[#111827] p-6 rounded-2xl text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F26722] text-white text-[10px] font-extrabold uppercase tracking-wider">
                Client Workspace
              </span>
              <span className="text-xs text-gray-400">Portal Standby</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Client Portal Hub</h1>
          </div>
        </div>

        <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No client accounts available</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Once client profiles are created in CRM or converted from won leads, their personalized deliverables, project roadmaps, and invoices will appear in this workspace.
          </p>
        </div>
      </div>
    );
  }

  // Scoped records strictly to this client
  const clientProjects = projects.filter(
    (p) => p.clientId === activeClient.id || p.clientName?.toLowerCase() === activeClient.companyName.toLowerCase()
  );
  const clientTasks = tasks.filter(
    (t) => t.clientName?.toLowerCase() === activeClient.companyName.toLowerCase()
  );
  const clientInvoices = invoices.filter(
    (i) => i.clientName?.toLowerCase() === activeClient.companyName.toLowerCase()
  );
  const clientDocs = documents.filter(
    (d) =>
      d.category === "Client Documents" ||
      d.category === "Contracts" ||
      d.category === "Proposals" ||
      d.name.toLowerCase().includes(activeClient.companyName.toLowerCase()) ||
      d.tags?.some((t) => t.toLowerCase() === activeClient.companyName.toLowerCase())
  );
  const clientTickets = tickets.filter(
    (t) => t.submittedBy?.toLowerCase().includes(activeClient.companyName.toLowerCase())
  );

  // Deliverables pending review (tasks that are not yet Completed)
  const pendingDeliverables = clientTasks.filter((t) => t.status !== "Completed");

  const handleApproveTask = (taskId: string, title: string) => {
    setApprovedItems((prev) => ({ ...prev, [taskId]: true }));
    updateTaskStatus(taskId, "Completed");
    addActivity({
      user: activeClient.primaryContact?.name || activeClient.companyName,
      action: `Approved deliverable: ${title}`,
      target: activeClient.companyName,
      type: "client",
    });
  };

  const handleOpenRevisionModal = (taskId: string) => {
    setRevisionTaskId(taskId);
    setRevisionFeedback("");
    setRevisionModalOpen(true);
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTaskId) return;

    setApprovedItems((prev) => ({ ...prev, [revisionTaskId]: false }));
    updateTaskStatus(revisionTaskId, "In Progress");

    createTicket({
      submittedBy: activeClient.companyName,
      category: "Campaign Issue",
      priority: "High",
      subject: `Revision Requested on Deliverable`,
      description: revisionFeedback || "Client requested changes to the deliverable asset.",
    });

    addActivity({
      user: activeClient.primaryContact?.name || activeClient.companyName,
      action: `Requested revision: ${revisionFeedback || "Changes required"}`,
      target: activeClient.companyName,
      type: "client",
    });

    setRevisionModalOpen(false);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    createTicket({
      submittedBy: activeClient.companyName,
      category: "Campaign Issue",
      priority: "High",
      subject,
      description: description || "Support request submitted via Client Portal.",
    });
    setSubject("");
    setDescription("");
    setTicketModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-[#111827] p-6 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 p-2 border border-white/20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeClient.logo || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150"}
              alt={activeClient.companyName}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F26722] text-white text-[10px] font-extrabold uppercase tracking-wider">
                Client Workspace
              </span>
              <span className="text-xs text-gray-400">
                {activeClient.industry} • {activeClient.location}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{activeClient.companyName}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Switcher Preview */}
          {(role === "MASTER_ADMIN" || role === "ACCOUNT_MANAGER" || role === "PROJECT_MANAGER") && clients.length > 1 && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <span className="text-gray-300 font-medium">Switch View:</span>
              <select
                value={activeClient.id}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="text-gray-900">
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={() => setTicketModalOpen(true)} className="bg-[#F26722] hover:bg-[#D95514]">
            <LifeBuoy className="w-4 h-4 mr-1.5" /> Support Request
          </Button>
        </div>
      </div>

      {/* Deliverable Approval Section */}
      <Card className="border-orange-200 bg-orange-50/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#F26722]" /> Deliverables Pending Client Sign-Off
              </CardTitle>
              <CardDescription>Review visual assets, campaign copy, and deliverables submitted by the agency</CardDescription>
            </div>
            <span className="text-xs font-bold text-[#F26722]">
              {pendingDeliverables.length} Deliverable{pendingDeliverables.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {pendingDeliverables.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-gray-800">All deliverables approved</p>
              <p className="text-xs text-gray-500 mt-0.5">There are no assets waiting for your review at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeliverables.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{task.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#F26722]">
                        {task.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {task.projectName} • Assigned to: <span className="font-semibold text-gray-700">{task.assignedTo}</span> • Target: {task.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {approvedItems[task.id] || task.status === "Completed" ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Approved for Launch
                      </span>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveTask(task.id, task.title)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRevisionModal(task.id)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Request Revision
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects & Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Client Projects */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active Engagements & Roadmaps</CardTitle>
              <CardDescription>Real-time campaign progress overview</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientProjects.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No active projects linked to your account.</p>
            ) : (
              clientProjects.map((p) => (
                <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{p.name}</span>
                    <Badge status={p.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Progress: <strong className="text-gray-900">{p.progress}%</strong>
                    </span>
                    <span>
                      PM: <strong className="text-gray-900">{p.projectManager}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#F26722] h-2 rounded-full transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Client Invoices & Settlement Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoices & Retainers</CardTitle>
                <CardDescription>Official tax invoices and settlement status</CardDescription>
              </div>
              <span className="text-xs font-bold text-gray-500 font-mono">
                {clientInvoices.length} Bills
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientInvoices.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No invoices issued for this account.</p>
            ) : (
              clientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold font-mono text-xs text-gray-900">{inv.invoiceNumber}</p>
                      <Badge status={inv.status} />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {inv.projectName} • Due: {inv.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-gray-900">{formatINR(inv.amount)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const html = buildInvoiceHTML({ invoice: inv, client: activeClient });
                        printDocument(html, `Invoice_${inv.invoiceNumber}`);
                      }}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contracts & Documents + Support Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Documents & Agreements */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Contracts & Brand Assets</CardTitle>
              <CardDescription>Signed agreements, brand guidelines, and legal documents</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientDocs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No contracts or assets uploaded yet.</p>
            ) : (
              clientDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#F26722]" />
                    <div>
                      <p className="font-bold text-gray-900">{doc.name}</p>
                      <p className="text-gray-400 text-[11px]">{doc.category} • {doc.size}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (doc.category === "Contracts") {
                        const html = buildClientContractHTML(activeClient);
                        printDocument(html, doc.name);
                      } else {
                        alert(`Opening official asset: ${doc.name}`);
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> View / Print
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Support & Campaign Requests</CardTitle>
                <CardDescription>Direct communications with your Account Manager</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setTicketModalOpen(true)}>
                <LifeBuoy className="w-3.5 h-3.5 mr-1" /> New Query
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientTickets.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No active support requests.</p>
            ) : (
              clientTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-900">{t.subject}</p>
                    <p className="text-[11px] text-gray-500">
                      {t.ticketNumber} • {t.createdAt}
                    </p>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Support Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Submit Support Ticket"
        description={`Direct communication with your Memoire Account Manager (${activeClient.accountManager || "Account Lead"})`}
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Subject"
            placeholder="e.g. Update lead form destination URL on meta campaigns"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <Textarea
            label="Description & Details"
            rows={4}
            placeholder="Provide specific details or links for the creative and technical team..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Revision Request Modal */}
      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Deliverable Revision"
        description="Specify changes or creative adjustments required by your brand team"
      >
        <form onSubmit={handleSubmitRevision} className="space-y-4">
          <Textarea
            label="Revision Instructions"
            rows={4}
            placeholder="Describe the copy, visual, or layout modifications needed before launch..."
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Revision Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

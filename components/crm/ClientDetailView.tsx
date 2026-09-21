"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input, Select, Textarea } from "../ui/input";
import { ActivityTimeline } from "../ui/activity-timeline";
import {
  exportToCSV,
  printDocument,
  downloadDocument,
  buildInvoiceHTML,
  buildClientReportHTML,
  buildClientContractHTML,
  buildProposalHTML,
  buildPaymentReceiptHTML,
} from "@/lib/export";
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  CheckSquare,
  FileText,
  MessageSquare,
  ArrowLeft,
  Plus,
  Printer,
  Download,
  Clock,
  ShieldCheck,
  Share2,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  FileCheck,
  Receipt,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientDetailView({ clientId, onBack }: { clientId: string; onBack: () => void }) {
  const router = useRouter();
  const {
    clients,
    projects,
    tasks,
    invoices,
    activities,
    services,
    documents,
    employees,
    leads,
    addProject,
    addTask,
    addInvoice,
    uploadDocument,
    updateClient,
    updateInvoiceStatus,
    addActivity,
    setSelectedClientId,
    setRole,
    isHydrated,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sub-modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [taskAssignedTo, setTaskAssignedTo] = useState(employees[0]?.name || "Team Specialist");
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split("T")[0]);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectCategory, setProjectCategory] = useState("BRAND & CREATIVE");
  const [projectBudget, setProjectBudget] = useState("450000");

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("350000");
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceProjectName, setInvoiceProjectName] = useState("");

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<"Client Documents" | "Contracts" | "Proposals" | "Brand Assets">("Client Documents");

  // Contract Modal
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractTitle, setContractTitle] = useState("Master Services Agreement & Creative Retainer");
  const [contractValue, setContractValue] = useState("");
  const [contractEffectiveDate, setContractEffectiveDate] = useState(new Date().toISOString().split("T")[0]);

  // Proposal Modal
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [propItem1Desc, setPropItem1Desc] = useState("Brand Identity Redesign & Guidelines");
  const [propItem1Price, setPropItem1Price] = useState("250000");
  const [propItem2Desc, setPropItem2Desc] = useState("Digital Growth Campaign Strategy & Execution");
  const [propItem2Price, setPropItem2Price] = useState("180000");
  const [proposalValidDays, setProposalValidDays] = useState("30");

  // Payment Recording Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEFT / Bank Transfer");
  const [paymentRefNumber, setPaymentRefNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const [notesText, setNotesText] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);

  // Communications log state
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commType, setCommType] = useState<"Call" | "WhatsApp" | "Email" | "Meeting">("Call");
  const [commSummary, setCommSummary] = useState("");
  const [localComms, setLocalComms] = useState<{ id: string; type: string; summary: string; date: string }[]>([]);

  // Hydration guard: render matching skeleton on initial render
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-44 bg-gray-100 rounded-2xl"></div>
        <div className="h-10 bg-gray-100 rounded-xl w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 rounded-2xl md:col-span-2"></div>
          <div className="h-64 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const client = clients.find((c) => c.id === clientId) || clients[0];

  if (!client) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Client Account Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested client record does not exist or has been removed.
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Clients Directory
        </Button>
      </div>
    );
  }

  const clientProjects = projects.filter(
    (p) => p.clientId === client.id || p.clientName?.toLowerCase() === client.companyName.toLowerCase()
  );
  const clientTasks = tasks.filter(
    (t) => t.clientName?.toLowerCase() === client.companyName.toLowerCase()
  );
  const clientInvoices = invoices.filter(
    (i) => i.clientName?.toLowerCase() === client.companyName.toLowerCase()
  );
  const clientDocs = documents.filter(
    (d) =>
      d.category === "Client Documents" ||
      d.category === "Contracts" ||
      d.category === "Proposals" ||
      d.name.toLowerCase().includes(client.companyName.toLowerCase()) ||
      d.tags?.some((t) => t.toLowerCase() === client.companyName.toLowerCase())
  );
  const clientActivities = activities.filter(
    (a) =>
      a.target?.toLowerCase().includes(client.companyName.toLowerCase()) ||
      a.action?.toLowerCase().includes(client.companyName.toLowerCase())
  );
  const clientLeads = leads.filter(
    (l) => l.companyName?.toLowerCase() === client.companyName.toLowerCase()
  );

  const totalInvoiced = clientInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = clientInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const outstandingBalance = totalInvoiced - totalPaid;

  const currentNotes = notesText !== null ? notesText : client.notes;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contacts", label: "Contacts", count: 1 + (client.additionalContacts?.length || 0) },
    { id: "services", label: "Services", count: client.services.length },
    { id: "projects", label: "Projects", count: clientProjects.length },
    { id: "tasks", label: "Tasks", count: clientTasks.length },
    { id: "documents", label: "Documents", count: clientDocs.length },
    { id: "billing", label: "Billing & Finance", count: clientInvoices.length },
    { id: "meetings", label: "Meetings" },
    { id: "notes", label: "Notes" },
    { id: "communication", label: "Communication", count: localComms.length },
    { id: "reports", label: "Reports" },
  ];

  // Action: Save Notes
  const handleSaveNotes = () => {
    updateClient(client.id, { notes: currentNotes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  // Action: Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;
    addProject({
      name: projectName,
      clientId: client.id,
      clientName: client.companyName,
      serviceCategory: projectCategory,
      projectManager: client.accountManager || "Founder",
      team: [client.accountManager || "Lead Specialist"],
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
      budget: Number(projectBudget) || 450000,
      priority: "High",
      status: "In Progress",
      description: `Project engagement for ${client.companyName} covering ${projectCategory}`,
    });
    setProjectName("");
    setProjectModalOpen(false);
  };

  // Action: Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    addTask({
      title: taskTitle,
      description: `Deliverable milestone for ${client.companyName}`,
      projectId: clientProjects[0]?.id || "p-gen",
      projectName: clientProjects[0]?.name || "Retainer Services",
      clientName: client.companyName,
      assignedTo: taskAssignedTo,
      assignedBy: "Account Manager",
      priority: taskPriority,
      status: "To Do",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: taskDueDate,
      estimatedHours: 8,
      tags: [client.industry, "Client Deliverable"],
    });
    setTaskTitle("");
    setTaskModalOpen(false);
  };

  // Action: Create Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceAmount) return;
    const invNum = `MEM-INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;
    addInvoice({
      invoiceNumber: invNum,
      clientName: client.companyName,
      projectName: invoiceProjectName || clientProjects[0]?.name || "Monthly Retainer",
      amount: Number(invoiceAmount),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: invoiceDueDate,
    });
    setInvoiceModalOpen(false);
  };

  // Action: Create Contract / MSA
  const handleGenerateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedClient = {
      ...client,
      annualValue: Number(contractValue) || client.annualValue,
    };
    const html = buildClientContractHTML(updatedClient, contractTitle);
    printDocument(html, `Contract_MSA_${client.companyName.replace(/\s+/g, "_")}`);
    uploadDocument({
      name: `Master Services Agreement - ${client.companyName}.pdf`,
      category: "Contracts",
      size: "248 KB",
      uploadedBy: "Legal & Contracts Desk",
      tags: [client.companyName, "MSA", "Contract", "Executed"],
      fileType: "pdf",
    });
    addActivity({
      user: "Legal Desk",
      action: `Generated Master Services Agreement for ${client.companyName}`,
      target: client.companyName,
      type: "client",
    });
    setContractModalOpen(false);
  };

  // Action: Create Proposal / Quotation
  const handleGenerateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const propNum = `MEM-PROP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    const items = [
      { description: propItem1Desc, timeline: "2-3 Weeks", price: Number(propItem1Price) || 250000 },
      { description: propItem2Desc, timeline: "Monthly Continuous", price: Number(propItem2Price) || 180000 },
    ];
    const validUntil = new Date(Date.now() + Number(proposalValidDays) * 86400000).toISOString().split("T")[0];
    const html = buildProposalHTML({
      proposalNumber: propNum,
      client,
      title: proposalTitle || "Strategic Creative & Growth Retainer",
      scopeItems: items,
      validUntil,
      terms: "50% advance mobilization deposit on approval; 50% on deliverable sign-off. Subject to Memoire standard MSA terms.",
    });
    printDocument(html, `Proposal_${propNum}_${client.companyName.replace(/\s+/g, "_")}`);
    uploadDocument({
      name: `Proposal ${propNum} - ${proposalTitle || "Creative Retainer"}.pdf`,
      category: "Proposals",
      size: "310 KB",
      uploadedBy: "Business Development",
      tags: [client.companyName, "Proposal", "Commercials"],
      fileType: "pdf",
    });
    addActivity({
      user: "BD Team",
      action: `Issued Commercial Proposal ${propNum} to ${client.companyName}`,
      target: client.companyName,
      type: "client",
    });
    setProposalModalOpen(false);
  };

  // Action: Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const receiptNum = `MEM-REC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const inv = invoices.find((i) => i.id === paymentInvoiceId) || clientInvoices[0];

    if (paymentInvoiceId) {
      updateInvoiceStatus(paymentInvoiceId, "Paid");
    }

    const html = buildPaymentReceiptHTML({
      receiptId: receiptNum,
      invoiceNumber: inv?.invoiceNumber || "RETAINER-ADVANCE",
      clientName: client.companyName,
      amount: Number(paymentAmount) || inv?.amount || 100000,
      date: paymentDate,
      method: paymentMethod,
      referenceNumber: paymentRefNumber || `UTR-${Date.now().toString().slice(-8)}`,
    });

    printDocument(html, `Payment_Receipt_${receiptNum}`);
    uploadDocument({
      name: `Payment Receipt ${receiptNum} - ${client.companyName}.pdf`,
      category: "Client Documents",
      size: "185 KB",
      uploadedBy: "Finance & Accounts",
      tags: [client.companyName, "Payment", "Settlement"],
      fileType: "pdf",
    });
    addActivity({
      user: "Finance Desk",
      action: `Recorded settlement ${formatINR(Number(paymentAmount) || inv?.amount || 0)} for ${client.companyName}`,
      target: client.companyName,
      type: "client",
    });
    setPaymentModalOpen(false);
  };

  // Action: Upload Document
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    uploadDocument({
      name: `${docName} - ${client.companyName}.pdf`,
      category: docCategory,
      size: "340 KB",
      uploadedBy: client.accountManager || "Account Lead",
      tags: [client.companyName, docCategory],
      fileType: "pdf",
    });
    setDocName("");
    setDocModalOpen(false);
  };

  // Action: Log Communication
  const handleLogComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSummary) return;
    const item = {
      id: `c-${Date.now()}`,
      type: commType,
      summary: commSummary,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLocalComms((prev) => [item, ...prev]);
    addActivity({
      user: client.accountManager || "Account Lead",
      action: `Logged ${commType} with ${client.companyName}`,
      target: client.companyName,
      type: "client",
    });
    setCommSummary("");
    setCommModalOpen(false);
  };

  // Export Dossier PDF
  const handleExportDossierPDF = () => {
    const html = buildClientReportHTML(client, projects, tasks, invoices);
    printDocument(html, `Client_Dossier_${client.companyName.replace(/\s+/g, "_")}`);
  };

  // Jump to Client Portal
  const handleOpenClientPortal = () => {
    setSelectedClientId(client.id);
    setRole("CLIENT");
    router.push("/client-portal");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients List
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={client.logo || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150"}
              alt={client.companyName}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">{client.companyName}</h1>
                <Badge status={client.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {client.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {client.location}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {client.website}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportDossierPDF}>
              <Printer className="w-4 h-4 mr-1.5" /> Export Dossier
            </Button>
            <Button size="sm" variant="outline" onClick={() => setContractModalOpen(true)}>
              <FileCheck className="w-4 h-4 mr-1.5" /> Contract / MSA
            </Button>
            <Button size="sm" variant="outline" onClick={() => setProposalModalOpen(true)}>
              <FileText className="w-4 h-4 mr-1.5" /> New Proposal
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
              <CreditCard className="w-4 h-4 mr-1.5" /> Record Payment
            </Button>
            <Button size="sm" variant="outline" onClick={handleOpenClientPortal}>
              <ExternalLink className="w-4 h-4 mr-1.5 text-[#F26722]" /> Open Portal
            </Button>
            <Button size="sm" onClick={() => setTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Task
            </Button>
          </div>
        </div>

        {/* Top High-Level Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 font-medium">Annual Retainer</span>
            <p className="text-lg font-black text-gray-900">{formatINR(client.annualValue)}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Total Invoiced</span>
            <p className="text-lg font-black text-gray-900">{formatINR(totalInvoiced)}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Outstanding Balance</span>
            <p className={`text-lg font-black ${outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {formatINR(outstandingBalance)}
            </p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Active Projects</span>
            <p className="text-lg font-black text-gray-900">{clientProjects.length}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Account Health</span>
            <p className="text-lg font-black text-emerald-600">{client.healthScore || 95}% Score</p>
          </div>
        </div>
      </div>

      {/* 11 Sub-Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-6 p-6">
            {/* Legal & Tax Particulars */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Corporate & Legal Profile
                </h3>
                <span className="text-xs font-semibold text-gray-500">
                  Client ID: <span className="font-mono text-gray-900">{client.id}</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-medium">Legal Registered Name</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.legalName || client.companyName}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Industry & Sector</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.industry}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">GSTIN Number</span>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{client.taxInfo?.gstin || "27AABCM8920C1Z8"}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Company PAN</span>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{client.taxInfo?.pan || "AABCM8920C"}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 font-medium">Registered Office Address</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {client.address?.street
                      ? `${client.address.street}, ${client.address.city}, ${client.address.state} - ${client.address.pincode}`
                      : client.location || "Navi Mumbai, Maharashtra"}
                  </p>
                </div>
              </div>
            </div>

            {/* Commercial & Billing Terms */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Commercial Terms</h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400">Billing Cycle</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.billingDetails?.billingCycle || "Monthly Retainer"}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400">Payment Terms</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.billingDetails?.paymentTerms || "Net 15 Days"}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400">Monthly Consideration</span>
                  <p className="font-bold text-[#F26722] mt-0.5">
                    {formatINR(client.billingDetails?.retainerAmount || Math.round(client.annualValue / 12))}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscribed Agency Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Subscribed Agency Services
                </h3>
                <span className="text-xs font-semibold text-[#F26722]">{client.services.length} Retainers Active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {client.services.map((s) => (
                  <Badge key={s} variant="orange">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Account Leadership Team */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Account Leadership Team</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400">Account Manager</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.accountManager || "Senior Account Lead"}</p>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400">Assigned Growth BDM</span>
                  <p className="font-bold text-gray-900 mt-0.5">{client.bdm || "Creative Strategy Lead"}</p>
                </div>
              </div>
            </div>

            {/* Strategic Notes */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Client Strategic Notes</h3>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {client.notes || "No strategic notes recorded yet. Use the Notes tab to record client preferences and requirements."}
              </p>
            </div>
          </Card>

          {/* Activity Feed & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Fast Workflow Hub</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setContractModalOpen(true)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#F26722]" />
                    <span className="font-bold text-gray-800">Generate Master Agreement (MSA)</span>
                  </div>
                  <Printer className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => setProposalModalOpen(true)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#F26722]" />
                    <span className="font-bold text-gray-800">Issue Quotation / Proposal</span>
                  </div>
                  <Printer className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-gray-800">Record Payment & Receipt</span>
                  </div>
                  <Printer className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={handleOpenClientPortal}
                  className="w-full text-left p-3 rounded-xl border border-orange-200 bg-orange-50/30 hover:bg-orange-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#F26722]" />
                    <span className="font-bold text-[#F26722]">Preview Client Portal View</span>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#F26722] rotate-180" />
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Client Activity Feed</h3>
              {clientActivities.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No recent activity logs for this client.</p>
              ) : (
                <ActivityTimeline activities={clientActivities.slice(0, 6)} />
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS */}
      {activeTab === "contacts" && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Brand Stakeholders & Points of Contact</h3>
              <p className="text-xs text-gray-500 mt-0.5">Primary decision makers and commercial liaison</p>
            </div>
            <Badge variant="emerald">Primary Contact Verified</Badge>
          </div>

          {/* Primary Contact Card */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-base text-gray-900">{client.primaryContact?.name || "Primary Contact"}</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-[#F26722]">PRIMARY</span>
              </div>
              <p className="text-xs font-semibold text-[#F26722] mt-0.5">{client.primaryContact?.designation || "Director / Brand Lead"}</p>
              <p className="text-xs text-gray-600 mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {client.primaryContact?.email || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {client.primaryContact?.phone || "N/A"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${client.primaryContact?.email || ""}`)}>
                <Mail className="w-3.5 h-3.5 mr-1" /> Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(`tel:${client.primaryContact?.phone || ""}`)}>
                <Phone className="w-3.5 h-3.5 mr-1" /> Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const num = (client.primaryContact?.phone || "").replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${num}`);
                }}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-600" /> WhatsApp
              </Button>
            </div>
          </div>

          {/* Additional Contacts */}
          {client.additionalContacts && client.additionalContacts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Additional Stakeholders</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.additionalContacts.map((c, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-gray-500">{c.designation}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" /> {c.email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" /> {c.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === "services" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Contracted Agency Services</h3>
              <p className="text-xs text-gray-500 mt-0.5">Retainers and active delivery capabilities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.services.map((svcName) => {
              const matched = services.find((s) => s.name === svcName);
              return (
                <div key={svcName} className="p-4 rounded-xl border border-orange-100 bg-orange-50/40 space-y-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#F26722] border border-orange-200">
                    {matched?.category || "SERVICE"}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{svcName}</h4>
                  <p className="text-xs text-gray-500">{matched?.description || "Monthly retainer deliverables and creative production."}</p>
                  <p className="text-xs font-black text-gray-900 pt-2 border-t border-orange-100">
                    {matched?.basePrice ? formatINR(matched.basePrice) : "Custom Retainer"} / mo
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === "projects" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Client Projects ({clientProjects.length})</h3>
              <p className="text-xs text-gray-500 mt-0.5">Campaigns, website redesigns, and creative retainers</p>
            </div>
            <Button size="sm" onClick={() => setProjectModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> New Project
            </Button>
          </div>
          {clientProjects.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No projects started yet</p>
              <p className="mt-0.5">Click "New Project" to launch the first deliverable for {client.companyName}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push("/projects")}
                  className="p-4 bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      {p.name}
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.serviceCategory} • PM: {p.projectManager} • Budget: {formatINR(p.budget)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-emerald-600">{p.progress}%</span>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: TASKS */}
      {activeTab === "tasks" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Tasks & Deliverables ({clientTasks.length})</h3>
              <p className="text-xs text-gray-500 mt-0.5">Assigned work packages and milestone deliverables</p>
            </div>
            <Button size="sm" onClick={() => setTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Task
            </Button>
          </div>
          {clientTasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No tasks created yet</p>
              <p className="mt-0.5">Assign deliverables to team members for this client.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {clientTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push("/tasks")}
                  className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      {t.title}
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </p>
                    <p className="text-gray-400 mt-0.5">
                      Assigned to <span className="font-semibold text-gray-700">{t.assignedTo}</span> • Due {t.dueDate}
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
        </Card>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === "documents" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Client Agreements, Briefs & Assets ({clientDocs.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Verified contracts, MSAs, proposals, and brand assets</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setContractModalOpen(true)}>
                <FileCheck className="w-4 h-4 mr-1.5" /> Generate MSA
              </Button>
              <Button size="sm" variant="outline" onClick={() => setProposalModalOpen(true)}>
                <FileText className="w-4 h-4 mr-1.5" /> Generate Proposal
              </Button>
              <Button size="sm" onClick={() => setDocModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Upload File
              </Button>
            </div>
          </div>
          {clientDocs.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No client documents stored</p>
              <p className="mt-0.5">Generate or upload contracts, proposals, and brand guidelines.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {clientDocs.map((d) => (
                <div key={d.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#F26722]" />
                    <div>
                      <p className="font-bold text-gray-900">{d.name}</p>
                      <p className="text-gray-400 mt-0.5">
                        {d.category} • {d.size} • Uploaded {d.uploadedDate} by {d.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (d.category === "Contracts") {
                          const html = buildClientContractHTML(client);
                          printDocument(html, d.name);
                        } else {
                          alert(`Viewing/downloading verified document: ${d.name}`);
                        }
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download / Print
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 7: BILLING & FINANCE */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Financial Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Total Billed</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalInvoiced)}</p>
              <p className="text-gray-400 mt-1">{clientInvoices.length} Invoices issued</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-emerald-200 text-xs">
              <span className="text-emerald-700 font-bold uppercase tracking-wider">Settled & Paid</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(totalPaid)}</p>
              <p className="text-emerald-600 mt-1">100% Verified settlements</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-orange-200 text-xs">
              <span className="text-rose-600 font-bold uppercase tracking-wider">Outstanding Due</span>
              <p className={`text-2xl font-black mt-1 ${outstandingBalance > 0 ? "text-rose-600" : "text-gray-900"}`}>
                {formatINR(outstandingBalance)}
              </p>
              <p className="text-gray-400 mt-1">
                {outstandingBalance > 0 ? "Action required: follow up on payment" : "All accounts cleared"}
              </p>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Invoices & Financial Summary</h3>
                <p className="text-xs text-gray-500 mt-0.5">Retainer billings, payment receipts, and settlement history</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
                  <Receipt className="w-4 h-4 mr-1.5 text-emerald-600" /> Record Payment
                </Button>
                <Button size="sm" onClick={() => setInvoiceModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
                </Button>
              </div>
            </div>

            {clientInvoices.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No invoices generated yet</p>
                <p className="mt-0.5">Click "Create Invoice" to bill this client.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-xs text-gray-900">{inv.invoiceNumber}</p>
                        <Badge status={inv.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.projectName} • Due: {inv.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-sm text-gray-900">{formatINR(inv.amount)}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const html = buildInvoiceHTML({ invoice: inv, client });
                          printDocument(html, `Invoice_${inv.invoiceNumber}`);
                        }}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> PDF / Print
                      </Button>
                      {inv.status !== "Paid" && (
                        <button
                          onClick={() => {
                            setPaymentInvoiceId(inv.id);
                            setPaymentAmount(inv.amount.toString());
                            setPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 8: MEETINGS */}
      {activeTab === "meetings" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Scheduled Client Syncs & Pitches</h3>
            <Button size="sm" onClick={() => router.push("/calendar")}>
              <Plus className="w-4 h-4 mr-1.5" /> Schedule Sync
            </Button>
          </div>
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-gray-900">Weekly Strategic Sprint Review</p>
              <p className="text-gray-500 mt-0.5">Every Thursday at 04:00 PM (Google Meet)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.open("https://meet.google.com")}>
              Join Meet
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 9: NOTES */}
      {activeTab === "notes" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Client Strategy Memo & Internal Notes</h3>
              <p className="text-xs text-gray-500 mt-0.5">Confidential account briefing and executive background</p>
            </div>
            {notesSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
          </div>
          <Textarea
            rows={6}
            value={currentNotes}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Document client preferences, key stakeholders, brand tone, or billing arrangements..."
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveNotes}>
              Save Client Notes
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 10: COMMUNICATION */}
      {activeTab === "communication" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Interaction & Touchpoint Log</h3>
              <p className="text-xs text-gray-500 mt-0.5">Calls, WhatsApp conversations, and executive meetings</p>
            </div>
            <Button size="sm" onClick={() => setCommModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Log Interaction
            </Button>
          </div>
          {localComms.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No interactions recorded</p>
              <p className="mt-0.5">Log key calls or meetings with client stakeholders to build an audit trail.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {localComms.map((c) => (
                <div key={c.id} className="p-3.5 space-y-1 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F26722]">{c.type}</span>
                    <span className="text-gray-400 font-mono">{c.date}</span>
                  </div>
                  <p className="text-gray-800">{c.summary}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 11: REPORTS */}
      {activeTab === "reports" && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Client Performance & Account Dossier</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Consolidated delivery progress, retainer utilization, and health metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportToCSV(
                    `${client.companyName}_Audit`,
                    clientInvoices.map((i) => ({
                      "Invoice #": i.invoiceNumber,
                      Project: i.projectName,
                      Amount: i.amount,
                      Status: i.status,
                    }))
                  )
                }
              >
                <Download className="w-4 h-4 mr-1.5" /> Export CSV
              </Button>
              <Button size="sm" onClick={handleExportDossierPDF}>
                <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF Dossier
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 font-bold uppercase">Total Invoiced</span>
              <p className="text-xl font-black text-gray-900 mt-1">{formatINR(totalInvoiced)}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
              <span className="text-emerald-700 font-bold uppercase">Revenue Collected</span>
              <p className="text-xl font-black text-emerald-800 mt-1">{formatINR(totalPaid)}</p>
            </div>
            <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 text-xs">
              <span className="text-orange-700 font-bold uppercase">Project Engagements</span>
              <p className="text-xl font-black text-[#F26722] mt-1">{clientProjects.length} Active</p>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================================== */}
      {/* MODAL: CREATE CONTRACT / MSA */}
      {/* ============================================================================== */}
      <Modal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        title={`Generate Master Services Agreement (MSA)`}
        description={`Execute legal agency contract for ${client.companyName}`}
      >
        <form onSubmit={handleGenerateContract} className="space-y-4">
          <Input
            label="Engagement / Project Title"
            value={contractTitle}
            onChange={(e) => setContractTitle(e.target.value)}
            required
          />
          <Input
            label="Annual Retainer Consideration (INR)"
            type="number"
            value={contractValue || client.annualValue.toString()}
            onChange={(e) => setContractValue(e.target.value)}
            required
          />
          <Input
            label="Effective Agreement Date"
            type="date"
            value={contractEffectiveDate}
            onChange={(e) => setContractEffectiveDate(e.target.value)}
            required
          />
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
            <p className="font-semibold text-gray-800 mb-1">Standard Terms Included:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Confidentiality & Non-Disclosure (NDA) protection</li>
              <li>Intellectual property release upon milestone settlement</li>
              <li>Jurisdiction & Dispute Resolution (Mumbai, India)</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setContractModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Generate & Print MSA</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: CREATE PROPOSAL / QUOTATION */}
      {/* ============================================================================== */}
      <Modal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title="Commercial Quotation & Proposal"
        description={`Formal scope of work & quotation for ${client.companyName}`}
      >
        <form onSubmit={handleGenerateProposal} className="space-y-4">
          <Input
            label="Proposal Engagement Title"
            placeholder="e.g. Omnichannel Growth Retainer 2026"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            required
          />
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Scope Deliverables</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  label="Deliverable 1"
                  value={propItem1Desc}
                  onChange={(e) => setPropItem1Desc(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Amount (INR)"
                type="number"
                value={propItem1Price}
                onChange={(e) => setPropItem1Price(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  label="Deliverable 2"
                  value={propItem2Desc}
                  onChange={(e) => setPropItem2Desc(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Amount (INR)"
                type="number"
                value={propItem2Price}
                onChange={(e) => setPropItem2Price(e.target.value)}
                required
              />
            </div>
          </div>
          <Input
            label="Proposal Validity (Days)"
            type="number"
            value={proposalValidDays}
            onChange={(e) => setProposalValidDays(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setProposalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Generate & Print Proposal</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: RECORD PAYMENT & ISSUE RECEIPT */}
      {/* ============================================================================== */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment & Issue Receipt"
        description={`Acknowledge settlement from ${client.companyName}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Settle Invoice (Optional)"
            value={paymentInvoiceId}
            onChange={(e) => {
              setPaymentInvoiceId(e.target.value);
              const matched = clientInvoices.find((i) => i.id === e.target.value);
              if (matched) setPaymentAmount(matched.amount.toString());
            }}
            options={[
              { label: "-- Select Invoice or Retainer Advance --", value: "" },
              ...clientInvoices.map((inv) => ({
                label: `${inv.invoiceNumber} — ${formatINR(inv.amount)} (${inv.status})`,
                value: inv.id,
              })),
            ]}
          />
          <Input
            label="Amount Paid (INR)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { label: "NEFT / RTGS Bank Transfer", value: "NEFT / RTGS Bank Transfer" },
              { label: "UPI (Corporate VPA)", value: "UPI Corporate" },
              { label: "Company Cheque", value: "Cheque Clearing" },
              { label: "International Wire / SWIFT", value: "Wire Transfer" },
            ]}
          />
          <Input
            label="Transaction / UTR Reference Number"
            placeholder="e.g. UTR293849201934"
            value={paymentRefNumber}
            onChange={(e) => setPaymentRefNumber(e.target.value)}
            required
          />
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Record & Print Receipt</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: CREATE PROJECT */}
      {/* ============================================================================== */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={`New Project — ${client.companyName}`}
        description="Launch an engagement scope tied directly to this client"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Q4 Growth Rebrand & Digital Campaign"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
          <Select
            label="Service Category"
            value={projectCategory}
            onChange={(e) => setProjectCategory(e.target.value)}
            options={[
              { label: "BRAND & CREATIVE", value: "BRAND & CREATIVE" },
              { label: "DIGITAL MARKETING", value: "DIGITAL MARKETING" },
              { label: "WEBSITE & TECHNOLOGY", value: "WEBSITE & TECHNOLOGY" },
              { label: "CONTENT & PRODUCTION", value: "CONTENT & PRODUCTION" },
            ]}
          />
          <Input
            label="Project Budget (INR)"
            type="number"
            value={projectBudget}
            onChange={(e) => setProjectBudget(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Launch Project</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: CREATE TASK */}
      {/* ============================================================================== */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={`New Task — ${client.companyName}`}
        description="Assign a client deliverable to a specialist"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Finalize Brand Identity Guidelines"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          <Select
            label="Assign Specialist"
            value={taskAssignedTo}
            onChange={(e) => setTaskAssignedTo(e.target.value)}
            options={employees.map((e) => ({ label: `${e.name} (${e.designation})`, value: e.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
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
            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Task</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: CREATE INVOICE */}
      {/* ============================================================================== */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title={`New Invoice — ${client.companyName}`}
        description="Issue a new retainer or milestone invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <Input
            label="Invoice Project / Service Description"
            placeholder="e.g. Creative Retainer - September 2026"
            value={invoiceProjectName}
            onChange={(e) => setInvoiceProjectName(e.target.value)}
            required
          />
          <Input
            label="Invoice Amount (INR)"
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value)}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={invoiceDueDate}
            onChange={(e) => setInvoiceDueDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: UPLOAD DOCUMENT */}
      {/* ============================================================================== */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title={`Upload Document — ${client.companyName}`}
        description="Store verified client contracts, briefs, or assets"
      >
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <Input
            label="Document Name"
            placeholder="e.g. Master Services Agreement 2026"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            required
          />
          <Select
            label="Document Category"
            value={docCategory}
            onChange={(e) => setDocCategory(e.target.value as any)}
            options={[
              { label: "Contracts", value: "Contracts" },
              { label: "Proposals", value: "Proposals" },
              { label: "Brand Assets", value: "Brand Assets" },
              { label: "Client Documents", value: "Client Documents" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setDocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save File</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================================== */}
      {/* MODAL: LOG COMMUNICATION */}
      {/* ============================================================================== */}
      <Modal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        title={`Log Client Interaction — ${client.companyName}`}
        description="Record notes from a client touchpoint"
      >
        <form onSubmit={handleLogComm} className="space-y-4">
          <Select
            label="Touchpoint Channel"
            value={commType}
            onChange={(e) => setCommType(e.target.value as any)}
            options={[
              { label: "Phone Call", value: "Call" },
              { label: "WhatsApp Message", value: "WhatsApp" },
              { label: "Official Email", value: "Email" },
              { label: "Video Meeting", value: "Meeting" },
            ]}
          />
          <Textarea
            label="Discussion Summary"
            rows={4}
            value={commSummary}
            onChange={(e) => setCommSummary(e.target.value)}
            placeholder="Key discussion points, approvals given, or client feedback..."
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setCommModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Interaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  ActivityItem,
  AgencyService,
  AttendanceRecord,
  ChatChannel,
  ChatMessage,
  Client,
  DocumentItem,
  Employee,
  Invoice,
  Lead,
  LeaveRequest,
  NotificationItem,
  Project,
  ReimbursementRequest,
  SalarySlipRequest,
  SupportTicket,
  Task,
  UserRole,
  WorkReport,
} from "@/types";
import {
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_CHANNELS,
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_INVOICES,
  INITIAL_LEADS,
  INITIAL_LEAVES,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROJECTS,
  INITIAL_REIMBURSEMENTS,
  INITIAL_REPORTS,
  INITIAL_SALARY_REQUESTS,
  INITIAL_TASKS,
  INITIAL_TICKETS,
  SERVICES_CATALOG,
} from "@/data/mockData";
import { createClient } from "@/lib/supabase/client";

export interface ContentPost {
  id: string;
  clientName: string;
  platform: "Instagram" | "Facebook" | "LinkedIn" | "YouTube" | "X";
  title: string;
  caption: string;
  creativeUrl: string;
  scheduledDate: string;
  status: "DRAFT" | "CLIENT_REVIEW" | "APPROVED" | "REVISION" | "SCHEDULED" | "PUBLISHED";
  hashtags: string;
  contentType?: "Static Post" | "Reel" | "Story" | "Carousel";
}

const INITIAL_POSTS: ContentPost[] = [];

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickCreateOpen: boolean;
  setQuickCreateOpen: (open: boolean) => void;

  // CRM
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
  winLead: (leadId: string) => void;
  deleteLead: (id: string) => void;

  clients: Client[];
  addClient: (client: Omit<Client, "id" | "joinedDate">) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  services: AgencyService[];
  addService: (service: Omit<AgencyService, "id" | "activeProjectsCount" | "activeClientsCount">) => void;
  updateService: (id: string, data: Partial<AgencyService>) => void;
  deleteService: (id: string) => void;

  // Social Content Calendar
  contentPosts: ContentPost[];
  addContentPost: (post: Omit<ContentPost, "id">) => void;
  updateContentPost: (id: string, data: Partial<ContentPost>) => void;
  deleteContentPost: (id: string) => void;

  // Operations
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "progress">) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: Project["status"]) => void;
  deleteProject: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "actualHours" | "checklist" | "comments">) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: Task["status"]) => void;
  toggleTaskChecklist: (taskId: string, itemId: string) => void;
  addTaskComment: (taskId: string, text: string, author: string) => void;
  deleteTask: (id: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Hydration status
  isHydrated: boolean;

  // HRMS
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "monthlyRating"> & { employeeId?: string; leaveBalance?: Employee["leaveBalance"] }) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  attendance: AttendanceRecord[];
  isPunchedIn: boolean;
  currentPunchTime: string | null;
  punchIn: () => void;
  punchOut: () => void;

  leaves: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => void;
  reviewLeave: (id: string, status: "Approved" | "Rejected") => void;

  salaryRequests: SalarySlipRequest[];
  requestSalarySlip: (month: string, year: string, reason: string) => void;

  workReports: WorkReport[];
  submitWorkReport: (report: Omit<WorkReport, "id" | "status">) => void;

  // Communication
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  sendMessage: (text: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // Assets & Finance
  documents: DocumentItem[];
  uploadDocument: (doc: Omit<DocumentItem, "id" | "uploadedDate">) => void;
  deleteDocument: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, "id" | "status">) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;

  reimbursements: ReimbursementRequest[];
  submitReimbursement: (reimb: Omit<ReimbursementRequest, "id" | "status">) => void;
  reviewReimbursement: (id: string, status: "Approved" | "Rejected") => void;

  tickets: SupportTicket[];
  createTicket: (tkt: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "status">) => void;

  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("FOUNDER");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [services, setServices] = useState<AgencyService[]>(SERVICES_CATALOG);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>(INITIAL_POSTS);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
  const [currentPunchTime, setCurrentPunchTime] = useState<string | null>(null);

  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [salaryRequests, setSalaryRequests] = useState<SalarySlipRequest[]>(INITIAL_SALARY_REQUESTS);
  const [workReports, setWorkReports] = useState<WorkReport[]>(INITIAL_REPORTS);

  const [channels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState<string>("ch-general");

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>(INITIAL_REIMBURSEMENTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Client-Side Cache Loader (runs post-mount to eliminate hydration mismatch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const CURRENT_VERSION = "fresh_production_v1";
      const storedVersion = localStorage.getItem("memoire_db_version");
      if (storedVersion !== CURRENT_VERSION) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("memoire_")) localStorage.removeItem(k);
        });
        localStorage.setItem("memoire_db_version", CURRENT_VERSION);
      } else {
        const storedLeads = localStorage.getItem("memoire_leads");
        if (storedLeads) setLeads(JSON.parse(storedLeads));

        const storedClients = localStorage.getItem("memoire_clients");
        if (storedClients) setClients(JSON.parse(storedClients));

        const storedProjects = localStorage.getItem("memoire_projects");
        if (storedProjects) setProjects(JSON.parse(storedProjects));

        const storedTasks = localStorage.getItem("memoire_tasks");
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedServices = localStorage.getItem("memoire_services");
        if (storedServices) setServices(JSON.parse(storedServices));

        const storedPosts = localStorage.getItem("memoire_content_posts");
        if (storedPosts) setContentPosts(JSON.parse(storedPosts));

        const storedEmployees = localStorage.getItem("memoire_employees");
        if (storedEmployees) setEmployees(JSON.parse(storedEmployees));

        const storedDocuments = localStorage.getItem("memoire_documents");
        if (storedDocuments) setDocuments(JSON.parse(storedDocuments));

        const storedInvoices = localStorage.getItem("memoire_invoices");
        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Sync state to LocalStorage cache once hydrated
  useEffect(() => {
    if (typeof window !== "undefined" && isHydrated) {
      localStorage.setItem("memoire_leads", JSON.stringify(leads));
      localStorage.setItem("memoire_clients", JSON.stringify(clients));
      localStorage.setItem("memoire_projects", JSON.stringify(projects));
      localStorage.setItem("memoire_tasks", JSON.stringify(tasks));
      localStorage.setItem("memoire_services", JSON.stringify(services));
      localStorage.setItem("memoire_content_posts", JSON.stringify(contentPosts));
      localStorage.setItem("memoire_employees", JSON.stringify(employees));
      localStorage.setItem("memoire_documents", JSON.stringify(documents));
      localStorage.setItem("memoire_invoices", JSON.stringify(invoices));
    }
  }, [isHydrated, leads, clients, projects, tasks, services, contentPosts, employees, documents, invoices]);

  // Initial Database Hydration from API Routes
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const [
          leadsRes,
          clientsRes,
          projectsRes,
          tasksRes,
          servicesRes,
          postsRes,
          employeesRes,
          attendanceRes,
          leavesRes,
          invoicesRes,
          reimbursementsRes,
          ticketsRes,
          notifsRes,
          docsRes,
          reportsRes,
        ] = await Promise.allSettled([
          fetch("/api/leads").then((r) => r.json()),
          fetch("/api/clients").then((r) => r.json()),
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/tasks").then((r) => r.json()),
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/content-posts").then((r) => r.json()),
          fetch("/api/employees").then((r) => r.json()),
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/leaves").then((r) => r.json()),
          fetch("/api/invoices").then((r) => r.json()),
          fetch("/api/reimbursements").then((r) => r.json()),
          fetch("/api/tickets").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
          fetch("/api/documents").then((r) => r.json()),
          fetch("/api/reports").then((r) => r.json()),
        ]);

        if (leadsRes.status === "fulfilled" && leadsRes.value?.success) setLeads(leadsRes.value.data);
        if (clientsRes.status === "fulfilled" && clientsRes.value?.success) setClients(clientsRes.value.data);
        if (projectsRes.status === "fulfilled" && projectsRes.value?.success) setProjects(projectsRes.value.data);
        if (tasksRes.status === "fulfilled" && tasksRes.value?.success) setTasks(tasksRes.value.data);
        if (servicesRes.status === "fulfilled" && servicesRes.value?.success) setServices(servicesRes.value.data);
        if (postsRes.status === "fulfilled" && postsRes.value?.success) setContentPosts(postsRes.value.data);
        if (employeesRes.status === "fulfilled" && employeesRes.value?.success) setEmployees(employeesRes.value.data);
        if (attendanceRes.status === "fulfilled" && attendanceRes.value?.success) setAttendance(attendanceRes.value.data);
        if (leavesRes.status === "fulfilled" && leavesRes.value?.success) setLeaves(leavesRes.value.data);
        if (invoicesRes.status === "fulfilled" && invoicesRes.value?.success) setInvoices(invoicesRes.value.data);
        if (reimbursementsRes.status === "fulfilled" && reimbursementsRes.value?.success) setReimbursements(reimbursementsRes.value.data);
        if (ticketsRes.status === "fulfilled" && ticketsRes.value?.success) setTickets(ticketsRes.value.data);
        if (notifsRes.status === "fulfilled" && notifsRes.value?.success) setNotifications(notifsRes.value.data);
        if (docsRes.status === "fulfilled" && docsRes.value?.success) setDocuments(docsRes.value.data);
        if (reportsRes.status === "fulfilled" && reportsRes.value?.success) setWorkReports(reportsRes.value.data);
      } catch (e) {
        console.warn("Using offline memory cache:", e);
      }
    }

    loadDatabaseData();
  }, []);

  // Supabase Realtime Listener Setup
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("memoire-realtime-hub")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as any;
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            channelId: msg.channel_id,
            senderName: msg.sender_name,
            senderAvatar: msg.sender_avatar,
            text: msg.text,
            timestamp: msg.timestamp,
          },
        ]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const notif = payload.new as any;
        setNotifications((prev) => [
          {
            id: notif.id,
            title: notif.title,
            description: notif.description,
            category: notif.category,
            timestamp: notif.timestamp || "Just now",
            read: false,
          },
          ...prev,
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addActivity = (act: Omit<ActivityItem, "id" | "timestamp">) => {
    const newAct: ActivityItem = { ...act, id: `act-${Date.now()}`, timestamp: "Just now" };
    setActivities((prev) => [newAct, ...prev]);
  };

  const addNotification = (title: string, description: string, category: NotificationItem["category"]) => {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      description,
      category,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // CRM Actions
  const addLead = async (leadData: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = { ...leadData, id: `lead-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] };
    setLeads((prev) => [newLead, ...prev]);
    addActivity({ user: "Amit Patel", action: "created lead", target: newLead.companyName, type: "lead" });

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } catch {}
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
    } catch {}
  };

  const winLead = async (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    updateLeadStatus(leadId, "Won");

    const newClient: Client = {
      id: `client-${Date.now()}`,
      companyName: targetLead.companyName,
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
      industry: targetLead.industry,
      website: `https://${targetLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
      location: targetLead.location,
      status: "Active",
      primaryContact: {
        id: `cont-${Date.now()}`,
        name: targetLead.contactName,
        designation: "Key Contact",
        email: targetLead.email,
        phone: targetLead.phone,
        isPrimary: true,
      },
      bdm: targetLead.assignedBDM,
      accountManager: employees[0]?.name || targetLead.assignedBDM || "Account Lead",
      services: targetLead.interestedServices,
      annualValue: targetLead.budget,
      healthScore: 90,
      joinedDate: new Date().toISOString().split("T")[0],
      notes: targetLead.notes,
    };
    setClients((prev) => [newClient, ...prev]);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: `${targetLead.companyName} Brand Retainer`,
      clientId: newClient.id,
      clientName: newClient.companyName,
      serviceCategory: targetLead.interestedServices[0] || "Brand & Digital Marketing",
      projectManager: employees[0]?.name || "Project Lead",
      team: employees.length > 0 ? employees.slice(0, 2).map((e) => e.name) : ["Creative Lead"],
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      budget: targetLead.budget,
      priority: "High",
      status: "Planning",
      progress: 10,
      description: `Initial brand onboarding for ${targetLead.companyName}.`,
    };
    setProjects((prev) => [newProj, ...prev]);

    addActivity({
      user: targetLead.assignedBDM,
      action: "won deal & onboarded client",
      target: `${targetLead.companyName}`,
      type: "lead",
    });

    try {
      await fetch(`/api/leads/${leadId}/win`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetLead),
      });
    } catch {}
  };

  const addClient = async (clientData: Omit<Client, "id" | "joinedDate">) => {
    const newClient: Client = { ...clientData, id: `client-${Date.now()}`, joinedDate: new Date().toISOString().split("T")[0] };
    setClients((prev) => [newClient, ...prev]);

    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
    } catch {}
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try {
      await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const deleteClient = async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
    } catch {}
  };

  const addService = async (serviceData: Omit<AgencyService, "id" | "activeProjectsCount" | "activeClientsCount">) => {
    const newServ: AgencyService = { ...serviceData, id: `serv-${Date.now()}`, activeProjectsCount: 1, activeClientsCount: 1 };
    setServices((prev) => [...prev, newServ]);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
    } catch {}
  };

  const updateService = async (id: string, data: Partial<AgencyService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    try {
      await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
    } catch {}
  };

  // Content Posts
  const addContentPost = async (postData: Omit<ContentPost, "id">) => {
    const newPost: ContentPost = { ...postData, id: `post-${Date.now()}` };
    setContentPosts((prev) => [newPost, ...prev]);
    try {
      await fetch("/api/content-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
    } catch {}
  };

  const updateContentPost = async (id: string, data: Partial<ContentPost>) => {
    setContentPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    try {
      await fetch(`/api/content-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const deleteContentPost = async (id: string) => {
    setContentPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/content-posts/${id}`, { method: "DELETE" });
    } catch {}
  };

  // Operations
  const addProject = async (projData: Omit<Project, "id" | "progress">) => {
    const newProj: Project = { ...projData, id: `proj-${Date.now()}`, progress: 0 };
    setProjects((prev) => [newProj, ...prev]);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projData),
      });
    } catch {}
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const updateProjectStatus = async (id: string, status: Project["status"]) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
    } catch {}
  };

  const addTask = async (taskData: Omit<Task, "id" | "actualHours" | "checklist" | "comments">) => {
    const newTask: Task = { ...taskData, id: `task-${Date.now()}`, actualHours: 0, checklist: [], comments: [] };
    setTasks((prev) => [newTask, ...prev]);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
    } catch {}
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const toggleTaskChecklist = async (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, completed: !c.completed } : c)) } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
    } catch {}
  };

  const addTaskComment = async (taskId: string, text: string, author: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, { id: `tc-${Date.now()}`, author, text, createdAt: "Just now" }] } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author }),
      });
    } catch {}
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {}
  };

  // HR Actions
  const addEmployee = async (empData: Omit<Employee, "id" | "monthlyRating"> & { employeeId?: string; leaveBalance?: Employee["leaveBalance"] }) => {
    const year = new Date().getFullYear();
    const count = String(employees.length + 1).padStart(3, "0");
    const autoId = `MEM-EMP-${year}-${count}`;
    const newEmp: Employee = {
      monthlyRating: 5.0,
      ...empData,
      id: `emp-${Date.now()}`,
      employeeId: empData.employeeId || autoId,
      leaveBalance: empData.leaveBalance || { casual: 12, sick: 10, earned: 15 },
    };
    setEmployees((prev) => [...prev, newEmp]);
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmp),
      });
    } catch {}
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    try {
      await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
    } catch {}
  };

  const punchIn = async () => {
    setIsPunchedIn(true);
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setCurrentPunchTime(timeStr);
    try {
      await fetch("/api/attendance/punch-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "MEM-101", employeeName: "Rahul Sharma" }),
      });
    } catch {}
  };

  const punchOut = async () => {
    setIsPunchedIn(false);
    try {
      await fetch("/api/attendance/punch-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "MEM-101", workSummary: "Daily shift deliverables completed." }),
      });
    } catch {}
  };

  const applyLeave = async (leaveData: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => {
    const newLeave: LeaveRequest = { ...leaveData, id: `lv-${Date.now()}`, status: "Pending", appliedOn: new Date().toISOString().split("T")[0] };
    setLeaves((prev) => [newLeave, ...prev]);
    try {
      await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveData),
      });
    } catch {}
  };

  const reviewLeave = async (id: string, status: "Approved" | "Rejected") => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status, reviewedBy: "Priya Nair" } : l)));
    try {
      await fetch(`/api/leaves/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewedBy: "Priya Nair" }),
      });
    } catch {}
  };

  const requestSalarySlip = (month: string, year: string, reason: string) => {
    const newReq: SalarySlipRequest = {
      id: `sal-${Date.now()}`,
      employeeId: "MEM-101",
      employeeName: "Rahul Sharma",
      month,
      year,
      reason,
      status: "Requested",
      requestedOn: new Date().toISOString().split("T")[0],
    };
    setSalaryRequests((prev) => [newReq, ...prev]);
  };

  const submitWorkReport = async (reportData: Omit<WorkReport, "id" | "status">) => {
    const newReport: WorkReport = { ...reportData, id: `rep-${Date.now()}`, status: "Submitted" };
    setWorkReports((prev) => [newReport, ...prev]);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
    } catch {}
  };

  // Communication
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderName: "Rahul Sharma",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: activeChannelId,
          text,
          senderName: "Rahul Sharma",
        }),
      });
    } catch {}
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  // Documents & Finance
  const uploadDocument = async (docData: Omit<DocumentItem, "id" | "uploadedDate">) => {
    const newDoc: DocumentItem = { ...docData, id: `doc-${Date.now()}`, uploadedDate: new Date().toISOString().split("T")[0] };
    setDocuments((prev) => [newDoc, ...prev]);
    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docData),
      });
    } catch {}
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    } catch {}
  };

  const addInvoice = async (invData: Omit<Invoice, "id" | "status">) => {
    const num = invoices.length + 82;
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `MEM-INV-2026-0${num}`,
      status: "Pending",
    };
    setInvoices((prev) => [newInv, ...prev]);
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invData),
      });
    } catch {}
  };

  const updateInvoiceStatus = async (id: string, status: Invoice["status"]) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const submitReimbursement = async (reimbData: Omit<ReimbursementRequest, "id" | "status">) => {
    const newReimb: ReimbursementRequest = { ...reimbData, id: `reimb-${Date.now()}`, status: "Submitted" };
    setReimbursements((prev) => [newReimb, ...prev]);
    try {
      await fetch("/api/reimbursements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reimbData),
      });
    } catch {}
  };

  const reviewReimbursement = async (id: string, status: "Approved" | "Rejected") => {
    setReimbursements((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await fetch(`/api/reimbursements/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const createTicket = async (tktData: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "status">) => {
    const num = tickets.length + 105;
    const newTkt: SupportTicket = { ...tktData, id: `tkt-${Date.now()}`, ticketNumber: `MEM-TKT-${num}`, status: "Open", createdAt: "Just now" };
    setTickets((prev) => [newTkt, ...prev]);
    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tktData),
      });
    } catch {}
  };

  return (
    <StoreContext.Provider
      value={{
        isHydrated,
        role,
        setRole,
        searchOpen,
        setSearchOpen,
        quickCreateOpen,
        setQuickCreateOpen,
        leads,
        addLead,
        updateLead,
        updateLeadStatus,
        winLead,
        deleteLead,
        clients,
        addClient,
        updateClient,
        deleteClient,
        selectedClientId,
        setSelectedClientId,
        services,
        addService,
        updateService,
        deleteService,
        contentPosts,
        addContentPost,
        updateContentPost,
        deleteContentPost,
        projects,
        addProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        tasks,
        addTask,
        updateTask,
        updateTaskStatus,
        toggleTaskChecklist,
        addTaskComment,
        deleteTask,
        selectedTaskId,
        setSelectedTaskId,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendance,
        isPunchedIn,
        currentPunchTime,
        punchIn,
        punchOut,
        leaves,
        applyLeave,
        reviewLeave,
        salaryRequests,
        requestSalarySlip,
        workReports,
        submitWorkReport,
        channels,
        messages,
        activeChannelId,
        setActiveChannelId,
        sendMessage,
        notifications,
        markNotificationRead,
        documents,
        uploadDocument,
        deleteDocument,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        reimbursements,
        submitReimbursement,
        reviewReimbursement,
        tickets,
        createTicket,
        activities,
        addActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}

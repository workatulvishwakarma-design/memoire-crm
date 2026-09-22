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
  INITIAL_CHANNELS,
  INITIAL_SALARY_REQUESTS,
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
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<Lead | null>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead["status"]) => Promise<void>;
  winLead: (leadId: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  clients: Client[];
  addClient: (client: Omit<Client, "id" | "joinedDate">) => Promise<Client | null>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  services: AgencyService[];
  addService: (service: Omit<AgencyService, "id" | "activeProjectsCount" | "activeClientsCount">) => Promise<void>;
  updateService: (id: string, data: Partial<AgencyService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Social Content Calendar
  contentPosts: ContentPost[];
  addContentPost: (post: Omit<ContentPost, "id">) => Promise<void>;
  updateContentPost: (id: string, data: Partial<ContentPost>) => Promise<void>;
  deleteContentPost: (id: string) => Promise<void>;

  // Operations
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "progress">) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  updateProjectStatus: (id: string, status: Project["status"]) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "actualHours" | "checklist" | "comments">) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  toggleTaskChecklist: (taskId: string, itemId: string) => Promise<void>;
  addTaskComment: (taskId: string, text: string, author: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Hydration status
  isHydrated: boolean;
  dbConnected: boolean;

  // HRMS
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "monthlyRating"> & { employeeId?: string; leaveBalance?: Employee["leaveBalance"] }) => Promise<Employee | null>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  isPunchedIn: boolean;
  setIsPunchedIn: (v: boolean) => void;
  currentPunchTime: string | null;
  setCurrentPunchTime: (t: string | null) => void;
  punchIn: () => void;
  punchOut: () => void;

  leaves: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => Promise<void>;
  reviewLeave: (id: string, status: "Approved" | "Rejected") => Promise<void>;

  salaryRequests: SalarySlipRequest[];
  requestSalarySlip: (month: string, year: string, reason: string) => void;

  workReports: WorkReport[];
  submitWorkReport: (report: Omit<WorkReport, "id" | "status">) => Promise<void>;

  // Communication
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;

  // Assets & Finance
  documents: DocumentItem[];
  uploadDocument: (doc: Omit<DocumentItem, "id" | "uploadedDate">) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, "id" | "status">) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => Promise<void>;

  reimbursements: ReimbursementRequest[];
  submitReimbursement: (reimb: Omit<ReimbursementRequest, "id" | "status">) => Promise<void>;
  reviewReimbursement: (id: string, status: "Approved" | "Rejected") => Promise<void>;

  tickets: SupportTicket[];
  createTicket: (tkt: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "status">) => Promise<void>;

  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void;

  // Data refresh
  refreshLeads: () => Promise<void>;
  refreshClients: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── Helper: safe API fetch ──────────────────────────────────────────────────
async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string; dbConnected?: boolean }> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message, dbConnected: false };
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("FOUNDER");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [services, setServices] = useState<AgencyService[]>(SERVICES_CATALOG);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>(INITIAL_POSTS);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
  const [currentPunchTime, setCurrentPunchTime] = useState<string | null>(null);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [salaryRequests, setSalaryRequests] = useState<SalarySlipRequest[]>(INITIAL_SALARY_REQUESTS);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);

  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>("ch-general");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // ─── PHASE 1: Load from localStorage on first mount (instant, no flash) ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const CURRENT_VERSION = "fresh_production_v2";
      const storedVersion = localStorage.getItem("memoire_db_version");
      if (storedVersion !== CURRENT_VERSION) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("memoire_")) localStorage.removeItem(k);
        });
        localStorage.setItem("memoire_db_version", CURRENT_VERSION);
      } else {
        function load<T>(key: string): T[] {
          try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
        const lsLeads = load<Lead>("memoire_leads");
        const lsClients = load<Client>("memoire_clients");
        const lsProjects = load<Project>("memoire_projects");
        const lsTasks = load<Task>("memoire_tasks");
        const lsServices = load<AgencyService>("memoire_services");
        const lsPosts = load<ContentPost>("memoire_content_posts");
        const lsEmployees = load<Employee>("memoire_employees");
        const lsDocuments = load<DocumentItem>("memoire_documents");
        const lsInvoices = load<Invoice>("memoire_invoices");
        const lsLeaves = load<LeaveRequest>("memoire_leaves");
        const lsReports = load<WorkReport>("memoire_reports");
        const lsAttendance = load<AttendanceRecord>("memoire_attendance");

        if (lsLeads.length) setLeads(lsLeads);
        if (lsClients.length) setClients(lsClients);
        if (lsProjects.length) setProjects(lsProjects);
        if (lsTasks.length) setTasks(lsTasks);
        if (lsServices.length) setServices(lsServices);
        if (lsPosts.length) setContentPosts(lsPosts);
        if (lsEmployees.length) setEmployees(lsEmployees);
        if (lsDocuments.length) setDocuments(lsDocuments);
        if (lsInvoices.length) setInvoices(lsInvoices);
        if (lsLeaves.length) setLeaves(lsLeaves);
        if (lsReports.length) setWorkReports(lsReports);
        if (lsAttendance.length) setAttendance(lsAttendance);
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // ─── PHASE 2: Sync to localStorage whenever state changes (write-through cache) ─
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("memoire_leads", JSON.stringify(leads));
      localStorage.setItem("memoire_clients", JSON.stringify(clients));
      localStorage.setItem("memoire_projects", JSON.stringify(projects));
      localStorage.setItem("memoire_tasks", JSON.stringify(tasks));
      localStorage.setItem("memoire_services", JSON.stringify(services));
      localStorage.setItem("memoire_content_posts", JSON.stringify(contentPosts));
      localStorage.setItem("memoire_employees", JSON.stringify(employees));
      localStorage.setItem("memoire_documents", JSON.stringify(documents));
      localStorage.setItem("memoire_invoices", JSON.stringify(invoices));
      localStorage.setItem("memoire_leaves", JSON.stringify(leaves));
      localStorage.setItem("memoire_reports", JSON.stringify(workReports));
      localStorage.setItem("memoire_attendance", JSON.stringify(attendance));
    } catch {}
  }, [isHydrated, leads, clients, projects, tasks, services, contentPosts, employees, documents, invoices, leaves, workReports, attendance]);

  // ─── PHASE 3: Hydrate from DB ONCE after mount (CRITICAL FIX: only update if DB has data) ──
  useEffect(() => {
    if (!isHydrated) return;

    async function syncFromDatabase() {
      try {
        const results = await Promise.allSettled([
          apiFetch("/api/leads"),
          apiFetch("/api/clients"),
          apiFetch("/api/projects"),
          apiFetch("/api/tasks"),
          apiFetch("/api/employees"),
          apiFetch("/api/attendance"),
          apiFetch("/api/leaves"),
          apiFetch("/api/invoices"),
          apiFetch("/api/reports"),
          apiFetch("/api/content-posts"),
          apiFetch("/api/documents"),
        ]);

        const [leadsR, clientsR, projectsR, tasksR, employeesR, attendanceR, leavesR, invoicesR, reportsR, postsR, docsR] = results;

        let connected = false;

        // CRITICAL FIX: Only replace state if DB returned real data (success:true with non-empty array)
        // This prevents the race condition where DB failure resets localStorage data
        if (leadsR.status === "fulfilled" && leadsR.value?.success && leadsR.value?.dbConnected) {
          connected = true;
          setLeads(leadsR.value.data ?? []);
        }
        if (clientsR.status === "fulfilled" && clientsR.value?.success && clientsR.value?.dbConnected) {
          connected = true;
          setClients(clientsR.value.data ?? []);
        }
        if (projectsR.status === "fulfilled" && projectsR.value?.success && projectsR.value?.dbConnected) {
          setProjects(projectsR.value.data ?? []);
        }
        if (tasksR.status === "fulfilled" && tasksR.value?.success && tasksR.value?.dbConnected) {
          setTasks(tasksR.value.data ?? []);
        }
        if (employeesR.status === "fulfilled" && employeesR.value?.success && employeesR.value?.dbConnected) {
          setEmployees(employeesR.value.data ?? []);
        }
        if (attendanceR.status === "fulfilled" && attendanceR.value?.success && attendanceR.value?.dbConnected) {
          setAttendance(attendanceR.value.data ?? []);
        }
        if (leavesR.status === "fulfilled" && leavesR.value?.success && leavesR.value?.dbConnected) {
          setLeaves(leavesR.value.data ?? []);
        }
        if (invoicesR.status === "fulfilled" && invoicesR.value?.success && invoicesR.value?.dbConnected) {
          setInvoices(invoicesR.value.data ?? []);
        }
        if (reportsR.status === "fulfilled" && reportsR.value?.success && reportsR.value?.dbConnected) {
          setWorkReports(reportsR.value.data ?? []);
        }
        if (postsR.status === "fulfilled" && postsR.value?.success && postsR.value?.dbConnected) {
          setContentPosts(postsR.value.data ?? []);
        }
        if (docsR.status === "fulfilled" && docsR.value?.success && docsR.value?.dbConnected) {
          setDocuments(docsR.value.data ?? []);
        }

        setDbConnected(connected);
      } catch (e) {
        console.warn("[Store] DB sync skipped — using localStorage cache:", e);
      }
    }

    syncFromDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // ─── Realtime Subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("memoire-realtime-hub")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as any;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              channelId: msg.channel_id,
              senderName: msg.sender_name,
              senderAvatar: msg.sender_avatar,
              text: msg.text,
              timestamp: msg.timestamp,
            },
          ];
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const notif = payload.new as any;
        setNotifications((prev) => {
          if (prev.find((n) => n.id === notif.id)) return prev;
          return [
            {
              id: notif.id,
              title: notif.title,
              description: notif.description,
              category: notif.category,
              timestamp: notif.timestamp || "Just now",
              read: false,
            },
            ...prev,
          ];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── Refresh helpers (can be called by pages after mutations) ───────────────
  const refreshLeads = useCallback(async () => {
    const r = await apiFetch<Lead[]>("/api/leads");
    if (r.success && r.dbConnected) setLeads(r.data ?? []);
  }, []);

  const refreshClients = useCallback(async () => {
    const r = await apiFetch<Client[]>("/api/clients");
    if (r.success && r.dbConnected) setClients(r.data ?? []);
  }, []);

  const refreshProjects = useCallback(async () => {
    const r = await apiFetch<Project[]>("/api/projects");
    if (r.success && r.dbConnected) setProjects(r.data ?? []);
  }, []);

  const refreshTasks = useCallback(async () => {
    const r = await apiFetch<Task[]>("/api/tasks");
    if (r.success && r.dbConnected) setTasks(r.data ?? []);
  }, []);

  const refreshEmployees = useCallback(async () => {
    const r = await apiFetch<Employee[]>("/api/employees");
    if (r.success && r.dbConnected) setEmployees(r.data ?? []);
  }, []);

  const refreshAttendance = useCallback(async () => {
    const r = await apiFetch<AttendanceRecord[]>("/api/attendance");
    if (r.success && r.dbConnected) setAttendance(r.data ?? []);
  }, []);

  // ─── Activity ───────────────────────────────────────────────────────────────
  const addActivity = (act: Omit<ActivityItem, "id" | "timestamp">) => {
    const newAct: ActivityItem = { ...act, id: `act-${Date.now()}`, timestamp: "Just now" };
    setActivities((prev) => [newAct, ...prev.slice(0, 49)]);
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

  // ─── CRM Actions ────────────────────────────────────────────────────────────
  const addLead = async (leadData: Omit<Lead, "id" | "createdAt">): Promise<Lead | null> => {
    const r = await apiFetch<Lead>("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (r.success && r.data) {
      setLeads((prev) => [r.data!, ...prev]);
      addActivity({ user: leadData.assignedBDM, action: "created lead", target: leadData.companyName, type: "lead" });
      return r.data;
    } else {
      // DB unavailable — optimistic local insert
      const localLead: Lead = { ...leadData, id: `lead-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] };
      setLeads((prev) => [localLead, ...prev]);
      addActivity({ user: leadData.assignedBDM, action: "created lead", target: leadData.companyName, type: "lead" });
      return localLead;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    await apiFetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await apiFetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await apiFetch(`/api/leads/${id}`, { method: "DELETE" });
  };

  const winLead = async (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    updateLeadStatus(leadId, "Won");

    const r = await apiFetch<{ client: Client; project: Project }>(`/api/leads/${leadId}/win`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetLead),
    });

    if (r.success && r.data) {
      setClients((prev) => [r.data!.client, ...prev]);
      setProjects((prev) => [r.data!.project, ...prev]);
    } else {
      // Optimistic local creation
      const newClient: Client = {
        id: `client-${Date.now()}`,
        companyName: targetLead.companyName,
        logo: "",
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
    }

    addActivity({
      user: targetLead.assignedBDM,
      action: "won deal & onboarded client",
      target: targetLead.companyName,
      type: "lead",
    });
  };

  const addClient = async (clientData: Omit<Client, "id" | "joinedDate">): Promise<Client | null> => {
    const r = await apiFetch<Client>("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (r.success && r.data) {
      setClients((prev) => [r.data!, ...prev]);
      addActivity({ user: "Admin", action: "added client", target: clientData.companyName, type: "client" });
      return r.data;
    } else {
      const localClient: Client = { ...clientData, id: `client-${Date.now()}`, joinedDate: new Date().toISOString().split("T")[0] };
      setClients((prev) => [localClient, ...prev]);
      return localClient;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    await apiFetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteClient = async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
  };

  const addService = async (serviceData: Omit<AgencyService, "id" | "activeProjectsCount" | "activeClientsCount">) => {
    const r = await apiFetch<AgencyService>("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });
    const newServ = r.success && r.data ? r.data : { ...serviceData, id: `serv-${Date.now()}`, activeProjectsCount: 0, activeClientsCount: 0 };
    setServices((prev) => [...prev, newServ]);
  };

  const updateService = async (id: string, data: Partial<AgencyService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    await apiFetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    await apiFetch(`/api/services/${id}`, { method: "DELETE" });
  };

  // Content Posts
  const addContentPost = async (postData: Omit<ContentPost, "id">) => {
    const r = await apiFetch<ContentPost>("/api/content-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const newPost = r.success && r.data ? r.data : { ...postData, id: `post-${Date.now()}` };
    setContentPosts((prev) => [newPost, ...prev]);
  };

  const updateContentPost = async (id: string, data: Partial<ContentPost>) => {
    setContentPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    await apiFetch(`/api/content-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteContentPost = async (id: string) => {
    setContentPosts((prev) => prev.filter((p) => p.id !== id));
    await apiFetch(`/api/content-posts/${id}`, { method: "DELETE" });
  };

  // Operations
  const addProject = async (projData: Omit<Project, "id" | "progress">): Promise<Project | null> => {
    const r = await apiFetch<Project>("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projData),
    });
    if (r.success && r.data) {
      setProjects((prev) => [r.data!, ...prev]);
      addActivity({ user: projData.projectManager, action: "created project", target: projData.name, type: "project" });
      return r.data;
    } else {
      const localProj: Project = { ...projData, id: `proj-${Date.now()}`, progress: 0 };
      setProjects((prev) => [localProj, ...prev]);
      return localProj;
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    await apiFetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const updateProjectStatus = async (id: string, status: Project["status"]) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    await apiFetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
  };

  const addTask = async (taskData: Omit<Task, "id" | "actualHours" | "checklist" | "comments">): Promise<Task | null> => {
    const r = await apiFetch<Task>("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (r.success && r.data) {
      setTasks((prev) => [r.data!, ...prev]);
      addActivity({ user: taskData.assignedBy, action: "created task", target: taskData.title, type: "task" });
      return r.data;
    } else {
      const localTask: Task = { ...taskData, id: `task-${Date.now()}`, actualHours: 0, checklist: [], comments: [] };
      setTasks((prev) => [localTask, ...prev]);
      return localTask;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    await apiFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await apiFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const toggleTaskChecklist = async (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, completed: !c.completed } : c)) } : t))
    );
    await apiFetch(`/api/tasks/${taskId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
  };

  const addTaskComment = async (taskId: string, text: string, author: string) => {
    const comment = { id: `tc-${Date.now()}`, author, text, createdAt: "Just now" };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t))
    );
    await apiFetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, author }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  // HR Actions
  const addEmployee = async (empData: Omit<Employee, "id" | "monthlyRating"> & { employeeId?: string; leaveBalance?: Employee["leaveBalance"] }): Promise<Employee | null> => {
    const year = new Date().getFullYear();
    const count = String(employees.length + 1).padStart(3, "0");
    const autoId = `MEM-EMP-${year}-${count}`;
    const payload = {
      ...empData,
      employeeId: empData.employeeId || autoId,
      leaveBalance: empData.leaveBalance || { casual: 12, sick: 10, earned: 15 },
    };

    const r = await apiFetch<Employee>("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (r.success && r.data) {
      setEmployees((prev) => [...prev, r.data!]);
      addActivity({ user: "HR", action: "added employee", target: empData.name, type: "lead" });
      return r.data;
    } else {
      const localEmp: Employee = { ...payload, id: `emp-${Date.now()}`, monthlyRating: 5.0 };
      setEmployees((prev) => [...prev, localEmp]);
      return localEmp;
    }
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    await apiFetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
  };

  // Legacy simple punch (used by old attendance page; real punch via /api/attendance/punch-in)
  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendance((prev) => [record, ...prev]);
  };

  const punchIn = async () => {
    setIsPunchedIn(true);
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setCurrentPunchTime(timeStr);
  };

  const punchOut = async () => {
    setIsPunchedIn(false);
    setCurrentPunchTime(null);
  };

  const applyLeave = async (leaveData: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => {
    const r = await apiFetch<LeaveRequest>("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveData),
    });
    const newLeave = r.success && r.data ? r.data : { ...leaveData, id: `lv-${Date.now()}`, status: "Pending" as const, appliedOn: new Date().toISOString().split("T")[0] };
    setLeaves((prev) => [newLeave, ...prev]);
  };

  const reviewLeave = async (id: string, status: "Approved" | "Rejected") => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await apiFetch(`/api/leaves/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const requestSalarySlip = (month: string, year: string, reason: string) => {
    const newReq: SalarySlipRequest = {
      id: `sal-${Date.now()}`,
      employeeId: "MEM-101",
      employeeName: "Employee",
      month,
      year,
      reason,
      status: "Requested",
      requestedOn: new Date().toISOString().split("T")[0],
    };
    setSalaryRequests((prev) => [newReq, ...prev]);
  };

  const submitWorkReport = async (reportData: Omit<WorkReport, "id" | "status">) => {
    const r = await apiFetch<WorkReport>("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    const newReport = r.success && r.data ? r.data : { ...reportData, id: `rep-${Date.now()}`, status: "Submitted" as const };
    setWorkReports((prev) => [newReport, ...prev]);
  };

  // Communication
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderName: "You",
      text,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, newMsg]);

    await apiFetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: activeChannelId, text, senderName: "You" }),
    });
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await apiFetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  // Documents & Finance
  const uploadDocument = async (docData: Omit<DocumentItem, "id" | "uploadedDate">) => {
    const r = await apiFetch<DocumentItem>("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(docData),
    });
    const newDoc = r.success && r.data ? r.data : { ...docData, id: `doc-${Date.now()}`, uploadedDate: new Date().toISOString().split("T")[0] };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
  };

  const addInvoice = async (invData: Omit<Invoice, "id" | "status">) => {
    const r = await apiFetch<Invoice>("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invData),
    });
    if (r.success && r.data) {
      setInvoices((prev) => [r.data!, ...prev]);
    } else {
      const num = invoices.length + 82;
      const newInv: Invoice = { ...invData, id: `inv-${Date.now()}`, invoiceNumber: `MEM-INV-2026-0${num}`, status: "Pending" };
      setInvoices((prev) => [newInv, ...prev]);
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice["status"]) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await apiFetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const submitReimbursement = async (reimbData: Omit<ReimbursementRequest, "id" | "status">) => {
    const r = await apiFetch<ReimbursementRequest>("/api/reimbursements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reimbData),
    });
    const newReimb = r.success && r.data ? r.data : { ...reimbData, id: `reimb-${Date.now()}`, status: "Submitted" as const };
    setReimbursements((prev) => [newReimb, ...prev]);
  };

  const reviewReimbursement = async (id: string, status: "Approved" | "Rejected") => {
    setReimbursements((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await apiFetch(`/api/reimbursements/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const createTicket = async (tktData: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "status">) => {
    const r = await apiFetch<SupportTicket>("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tktData),
    });
    if (r.success && r.data) {
      setTickets((prev) => [r.data!, ...prev]);
    } else {
      const num = tickets.length + 105;
      const newTkt: SupportTicket = { ...tktData, id: `tkt-${Date.now()}`, ticketNumber: `MEM-TKT-${num}`, status: "Open", createdAt: "Just now" };
      setTickets((prev) => [newTkt, ...prev]);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        isHydrated,
        dbConnected,
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
        setAttendance,
        addAttendanceRecord,
        isPunchedIn,
        setIsPunchedIn,
        currentPunchTime,
        setCurrentPunchTime,
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
        refreshLeads,
        refreshClients,
        refreshProjects,
        refreshTasks,
        refreshEmployees,
        refreshAttendance,
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

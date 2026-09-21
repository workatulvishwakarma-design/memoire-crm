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
  WorkReport,
} from "@/types";

// ==============================================================================
// MEMOIRE CRM — CLEAN PRODUCTION DATASET (ALL DEMO RECORDS REMOVED)
// ==============================================================================
// Transactional CRM tables start completely empty for fresh real-world data entry.
// Schema, permissions, agency service definitions, and configurations are preserved.
// ==============================================================================

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CLIENTS: Client[] = [];

export const SERVICES_CATALOG: AgencyService[] = [
  {
    id: "serv-1",
    name: "Brand Identity Design",
    category: "BRAND & CREATIVE",
    description: "Comprehensive logo, typography, color palette, brand guidelines, and visual asset systems.",
    pricingType: "Project Based",
    basePrice: 250000,
    activeProjectsCount: 0,
    activeClientsCount: 0,
  },
  {
    id: "serv-2",
    name: "Performance Marketing & Ads",
    category: "DIGITAL MARKETING",
    description: "Data-driven Meta Ads & Google Ads setup, custom audience targeting, and ROI optimization.",
    pricingType: "Retainer",
    basePrice: 150000,
    activeProjectsCount: 0,
    activeClientsCount: 0,
  },
  {
    id: "serv-3",
    name: "Full-Stack Web Development",
    category: "WEBSITE & TECHNOLOGY",
    description: "Next.js, React, Tailwind CSS, custom CMS, and high-performance Web Applications.",
    pricingType: "Project Based",
    basePrice: 450000,
    activeProjectsCount: 0,
    activeClientsCount: 0,
  },
  {
    id: "serv-4",
    name: "Social Media Management & Reels",
    category: "CONTENT & PRODUCTION",
    description: "Monthly content calendar, 4K Reels production, graphic posts, and community management.",
    pricingType: "Retainer",
    basePrice: 120000,
    activeProjectsCount: 0,
    activeClientsCount: 0,
  },
  {
    id: "serv-5",
    name: "Packaging & Retail Design",
    category: "PACKAGING & SPACE",
    description: "Unboxing design, eco-friendly product packaging, label design, and store display mockups.",
    pricingType: "Project Based",
    basePrice: 300000,
    activeProjectsCount: 0,
    activeClientsCount: 0,
  },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_SALARY_REQUESTS: SalarySlipRequest[] = [];

export const INITIAL_REPORTS: WorkReport[] = [];

export const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: "ch-general",
    name: "# general",
    type: "channel",
    description: "All-hands agency discussions and announcements",
    unreadCount: 0,
    members: [],
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_REIMBURSEMENTS: ReimbursementRequest[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

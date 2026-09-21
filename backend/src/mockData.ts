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
} from "../../types";

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    companyName: "Aarav Foods",
    contactName: "Vikram Malhotra",
    email: "vikram@aaravfoods.in",
    phone: "+91 98201 44512",
    whatsapp: "+91 98201 44512",
    industry: "D2C / F&B",
    location: "Mumbai",
    source: "Instagram Inbound",
    interestedServices: ["Brand Identity Design", "Packaging Design", "Social Media Marketing"],
    budget: 850000,
    expectedClosing: "2026-08-25",
    assignedBDM: "Amit Patel",
    leadScore: 88,
    status: "Negotiation",
    notes: "Requires complete rebrand and eco-friendly packaging redesign for new snack line.",
    createdAt: "2026-08-01",
    nextFollowUp: "2026-08-12",
  },
  {
    id: "lead-2",
    companyName: "UrbanNest Realty",
    contactName: "Rajesh Sharma",
    email: "r.sharma@urbannest.co.in",
    phone: "+91 97112 33400",
    industry: "Real Estate",
    location: "Navi Mumbai",
    source: "Referral",
    interestedServices: ["Meta Ads", "Lead Generation", "3D Architecture Renders"],
    budget: 1500000,
    expectedClosing: "2026-08-20",
    assignedBDM: "Amit Patel",
    leadScore: 95,
    status: "Won",
    notes: "Converted! Retainer for luxury housing development campaign launched in Kharghar.",
    createdAt: "2026-07-15",
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "client-1",
    companyName: "UrbanNest Realty",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&auto=format&fit=crop&q=80",
    industry: "Real Estate",
    website: "https://urbannest.co.in",
    location: "Navi Mumbai, MH",
    status: "VIP",
    primaryContact: {
      id: "cont-1",
      name: "Rajesh Sharma",
      designation: "Marketing Director",
      email: "r.sharma@urbannest.co.in",
      phone: "+91 97112 33400",
      isPrimary: true,
    },
    bdm: "Amit Patel",
    accountManager: "Rohan Mehta",
    services: ["Meta Ads", "Lead Generation", "3D Architecture Renders", "Website Development"],
    annualValue: 1800000,
    healthScore: 94,
    joinedDate: "2025-11-10",
    notes: "High-value enterprise real estate client with 3 active towers in development.",
  },
];

export const SERVICES_CATALOG: AgencyService[] = [
  {
    id: "serv-1",
    name: "Brand Identity Design",
    category: "BRAND & CREATIVE",
    description: "Comprehensive logo, typography, color palette, brand guidelines, and visual asset systems.",
    pricingType: "Project Based",
    basePrice: 250000,
    activeProjectsCount: 5,
    activeClientsCount: 4,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "UrbanNest Tower A Launch",
    clientId: "client-1",
    clientName: "UrbanNest Realty",
    serviceCategory: "Digital Marketing & Performance Ads",
    projectManager: "Rohan Mehta",
    team: ["Sneha Kulkarni", "Ananya Iyer", "Vikram Singh"],
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    budget: 750000,
    priority: "Urgent",
    status: "In Progress",
    progress: 45,
    description: "Multi-channel lead gen campaign for Kharghar luxury apartments with landing page & video ads.",
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Finalize Kharghar Tower A Meta Ad Creatives",
    description: "Design 4 carousel posts and 2 video reel thumbnails for Facebook/Instagram ads.",
    projectId: "proj-1",
    projectName: "UrbanNest Tower A Launch",
    clientName: "UrbanNest Realty",
    assignedTo: "Ananya Iyer",
    assignedBy: "Rohan Mehta",
    priority: "Urgent",
    status: "In Progress",
    startDate: "2026-08-08",
    dueDate: "2026-08-12",
    estimatedHours: 8,
    actualHours: 5,
    checklist: [],
    comments: [],
    tags: ["Design", "Meta Ads"],
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    employeeId: "MEM-101",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "rahul@memoire.co.in",
    phone: "+91 98200 11223",
    department: "Management",
    designation: "Founder & Creative Director",
    reportingManager: "Board",
    joiningDate: "2020-01-01",
    employmentStatus: "Full-Time",
    workLocation: "Navi Mumbai Office",
    skills: ["Brand Strategy"],
    leaveBalance: { casual: 12, sick: 10, earned: 20 },
    monthlyRating: 5.0,
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_LEAVES: LeaveRequest[] = [];
export const INITIAL_SALARY_REQUESTS: SalarySlipRequest[] = [];
export const INITIAL_REPORTS: WorkReport[] = [];
export const INITIAL_CHANNELS: ChatChannel[] = [];
export const INITIAL_MESSAGES: ChatMessage[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_REIMBURSEMENTS: ReimbursementRequest[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_ACTIVITIES: ActivityItem[] = [];

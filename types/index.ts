export type UserRole =
  | "FOUNDER"
  | "MASTER_ADMIN"
  | "HR"
  | "BDM"
  | "ACCOUNT_MANAGER"
  | "PROJECT_MANAGER"
  | "EMPLOYEE"
  | "FINANCE"
  | "TEAM_LEAD"
  | "CLIENT";

export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve?: boolean;
}

export interface RolePermissions {
  clients: PermissionSet;
  leads: PermissionSet;
  projects: PermissionSet;
  tasks: PermissionSet;
  employees: PermissionSet;
  hr: PermissionSet;
  finance: PermissionSet;
  settings: PermissionSet;
  clientPortal: PermissionSet;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  type: "lead" | "client" | "project" | "task" | "leave" | "report" | "document" | "finance" | "attendance";
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  industry: string;
  location: string;
  source: string;
  interestedServices: string[];
  budget: number;
  expectedClosing: string;
  assignedBDM: string;
  leadScore: number;
  status: "New" | "Contacted" | "Qualified" | "Meeting Scheduled" | "Proposal Sent" | "Negotiation" | "Won" | "Lost" | "Follow Up";
  notes: string;
  createdAt: string;
  nextFollowUp?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  legalName?: string;
  logo: string;
  industry: string;
  website: string;
  location: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  taxInfo?: {
    gstin?: string;
    pan?: string;
    taxNumber?: string;
  };
  status: "Active" | "Prospect" | "Inactive" | "VIP";
  primaryContact: ClientContact;
  additionalContacts?: ClientContact[];
  bdm: string;
  accountManager: string;
  services: string[];
  annualValue: number;
  healthScore: number; // 0 to 100
  billingDetails?: {
    billingCycle: "Monthly Retainer" | "Quarterly" | "Milestone Based" | "Annual";
    paymentTerms: "Due on Receipt" | "Net 15" | "Net 30" | "Net 45";
    retainerAmount: number;
  };
  joinedDate: string;
  notes: string;
}

export interface AgencyService {
  id: string;
  name: string;
  category: "BRAND & CREATIVE" | "DIGITAL MARKETING" | "WEBSITE & TECHNOLOGY" | "ADVERTISING" | "CONTENT & PRODUCTION" | "PACKAGING & SPACE";
  description: string;
  pricingType: "Retainer" | "Project Based" | "Custom";
  basePrice: number;
  activeProjectsCount: number;
  activeClientsCount: number;
}

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  serviceCategory: string;
  projectManager: string;
  team: string[];
  startDate: string;
  endDate: string;
  budget: number;
  priority: Priority;
  status: "Planning" | "In Progress" | "Review" | "Client Approval" | "Completed" | "On Hold";
  progress: number; // 0 to 100
  description: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  clientName: string;
  assignedTo: string; // Employee Name
  assignedToAvatar?: string;
  assignedBy: string;
  priority: Priority;
  status: "To Do" | "In Progress" | "Review" | "Completed" | "Blocked";
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  tags: string[];
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  maritalStatus?: "Single" | "Married" | "Other";
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  department: "Management" | "Creative & Brand" | "Digital Marketing" | "Technology" | "BDM & Sales" | "HR & Ops" | "Finance";
  designation: string;
  role?: UserRole;
  reportingManager: string;
  joiningDate: string;
  employmentStatus: "Full-Time" | "Probation" | "Contract" | "Intern";
  workLocation: "Navi Mumbai Office" | "Remote" | "Hybrid";
  skills: string[];
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
  };
  salary?: {
    annualCtc: number;
    monthlyGross: number;
    basic: number;
    hra: number;
    specialAllowance: number;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    pan: string;
    aadhaar?: string;
  };
  loginCredentials?: {
    username: string;
    status: "Active" | "Suspended" | "Pending";
    lastLogin?: string;
  };
  monthlyRating: number; // 1 to 5
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  workingHours: string;
  breakDuration: string;
  location: string;
  gpsStatus: string;
  status: "Present" | "Late" | "Half Day" | "Absent" | "Leave" | "Weekend";
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Earned Leave" | "Half Day" | "Work From Home";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn: string;
  reviewedBy?: string;
}

export interface SalarySlipRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: string;
  reason: string;
  status: "Requested" | "Processing" | "Ready" | "Rejected";
  requestedOn: string;
  downloadUrl?: string;
}

export interface WorkReport {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Daily" | "Weekly";
  date: string;
  tasksCompleted: string[];
  hoursWorked: number;
  achievements: string;
  challenges: string;
  nextPlan: string;
  status: "Submitted" | "Approved" | "Changes Requested";
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. "dm-1" or "ch-general"
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  attachments?: string[];
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "direct" | "channel" | "project";
  description?: string;
  unreadCount: number;
  members: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "Tasks" | "HR" | "CRM" | "Messages" | "System";
  read: boolean;
  link?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: "Employee Documents" | "Client Documents" | "Project Documents" | "Contracts" | "Proposals" | "Brand Assets";
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
  fileType: "pdf" | "doc" | "png" | "figma" | "zip";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  projectName: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

export interface ReimbursementRequest {
  id: string;
  employeeName: string;
  expenseType: string;
  amount: number;
  date: string;
  description: string;
  project: string;
  status: "Submitted" | "Approved" | "Rejected" | "Paid";
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  submittedBy: string; // Client or Employee Name
  category: "IT Request" | "HR Request" | "Finance Request" | "Website Issue" | "Campaign Issue";
  priority: Priority;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  createdAt: string;
}

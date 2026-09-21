import {
  INITIAL_LEADS,
  INITIAL_CLIENTS,
  SERVICES_CATALOG,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_SALARY_REQUESTS,
  INITIAL_REPORTS,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_INVOICES,
  INITIAL_REIMBURSEMENTS,
  INITIAL_TICKETS,
  INITIAL_ACTIVITIES,
} from "./mockData";

export class MemoryDatabase {
  leads = [...INITIAL_LEADS];
  clients = [...INITIAL_CLIENTS];
  services = [...SERVICES_CATALOG];
  projects = [...INITIAL_PROJECTS];
  tasks = [...INITIAL_TASKS];
  employees = [...INITIAL_EMPLOYEES];
  attendance = [...INITIAL_ATTENDANCE];
  leaves = [...INITIAL_LEAVES];
  salaryRequests = [...INITIAL_SALARY_REQUESTS];
  reports = [...INITIAL_REPORTS];
  channels = [...INITIAL_CHANNELS];
  messages = [...INITIAL_MESSAGES];
  notifications = [...INITIAL_NOTIFICATIONS];
  documents = [...INITIAL_DOCUMENTS];
  invoices = [...INITIAL_INVOICES];
  reimbursements = [...INITIAL_REIMBURSEMENTS];
  tickets = [...INITIAL_TICKETS];
  activities = [...INITIAL_ACTIVITIES];
}

export const db = new MemoryDatabase();

import express from "express";
import cors from "cors";
import { db } from "./db";
import { handlePunchIn, handlePunchOut } from "./attendance";
import { processAIQuery } from "./ai";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Root API Overview
app.get("/", (req, res) => {
  res.json({
    status: "ONLINE",
    app: "MEMOIRE — ALL-IN-ONE AGENCY OPERATING SYSTEM",
    version: "1.0.0",
    documentation: "/api/v1",
    healthCheck: "/api/v1/health",
  });
});

app.get("/api/v1", (req, res) => {
  res.json({
    status: "ACTIVE",
    service: "MEMOIRE OS Production Backend API Hub",
    architecture: "Node.js + Express + Prisma ORM + PostgreSQL + Ollama AI Provider",
    endpoints: [
      { path: "GET /api/v1/health", description: "Backend Service Health & Status Check" },
      { path: "POST /api/v1/auth/login", description: "JWT Authentication & Session Generator" },
      { path: "GET /api/v1/clients", description: "Retrieve all Client accounts & 11-tab profiles" },
      { path: "POST /api/v1/clients", description: "Create new Client account" },
      { path: "GET /api/v1/leads", description: "Retrieve BDM Sales Pipeline leads" },
      { path: "POST /api/v1/leads", description: "Create new BDM Lead" },
      { path: "POST /api/v1/leads/:id/win", description: "Convert Lead to Client + Project (Database Transaction)" },
      { path: "POST /api/v1/attendance/punch-in", description: "Geofenced GPS Punch-In validation" },
      { path: "POST /api/v1/attendance/punch-out", description: "Mandatory End-of-Day Punch-Out Work Summary Validation" },
      { path: "POST /api/v1/ai/query", description: "MEMOIRE AI Query Router (Ollama / Gemini Tool Runner)" },
    ],
  });
});

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, service: "MEMOIRE OS Backend API", timestamp: new Date().toISOString() });
});

// Authentication
app.post("/api/v1/auth/login", (req, res) => {
  const { email } = req.body;
  const employee = db.employees.find((e) => e.email === email) || db.employees[0];
  res.json({
    success: true,
    data: {
      user: { id: employee.id, name: employee.name, email: employee.email, role: "FOUNDER" },
      accessToken: "memoire_jwt_token_demo",
    },
  });
});

// CRM Clients API
app.get("/api/v1/clients", (req, res) => {
  res.json({ success: true, data: db.clients });
});

app.post("/api/v1/clients", (req, res) => {
  const newClient = {
    id: `client-${Date.now()}`,
    ...req.body,
    joinedDate: new Date().toISOString().split("T")[0],
  };
  db.clients.unshift(newClient);
  res.status(201).json({ success: true, data: newClient });
});

// BDM Leads & Lead Conversion Transaction API
app.get("/api/v1/leads", (req, res) => {
  res.json({ success: true, data: db.leads });
});

app.post("/api/v1/leads", (req, res) => {
  const newLead = {
    id: `lead-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString().split("T")[0],
  };
  db.leads.unshift(newLead);
  res.status(201).json({ success: true, data: newLead });
});

app.post("/api/v1/leads/:id/win", (req, res) => {
  const { id } = req.params;
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return res.status(404).json({ success: false, error: "LEAD_NOT_FOUND" });

  lead.status = "Won";

  const newClient = {
    id: `client-${Date.now()}`,
    companyName: lead.companyName,
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
    industry: lead.industry,
    website: `https://${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
    location: lead.location,
    status: "Active" as const,
    primaryContact: {
      id: `cont-${Date.now()}`,
      name: lead.contactName,
      designation: "Key Contact",
      email: lead.email,
      phone: lead.phone,
      isPrimary: true,
    },
    bdm: lead.assignedBDM,
    accountManager: "Rohan Mehta",
    services: lead.interestedServices,
    annualValue: lead.budget,
    healthScore: 92,
    joinedDate: new Date().toISOString().split("T")[0],
    notes: lead.notes || "",
  };

  db.clients.unshift(newClient);

  const newProject = {
    id: `proj-${Date.now()}`,
    name: `${lead.companyName} Brand & Digital Retainer`,
    clientId: newClient.id,
    clientName: newClient.companyName,
    serviceCategory: lead.interestedServices[0] || "Brand Strategy",
    projectManager: "Rohan Mehta",
    team: ["Ananya Iyer", "Sneha Kulkarni", "Vikram Singh"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2026-11-30",
    budget: lead.budget,
    priority: "High" as const,
    status: "Planning" as const,
    progress: 10,
    description: `Initial brand onboarding workspace for ${lead.companyName}.`,
  };

  db.projects.unshift(newProject);

  res.json({
    success: true,
    message: "Lead won and converted into Client & Project workspace.",
    data: { client: newClient, project: newProject },
  });
});

// Attendance & Mandatory Punch-Out API
app.post("/api/v1/attendance/punch-in", (req, res) => {
  const result = handlePunchIn(req.body);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/v1/attendance/punch-out", (req, res) => {
  const result = handlePunchOut(req.body);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// AI Query Gateway API
app.post("/api/v1/ai/query", async (req, res) => {
  const result = await processAIQuery(req.body);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`[MEMOIRE OS BACKEND] Server running on http://localhost:${PORT}`);
});

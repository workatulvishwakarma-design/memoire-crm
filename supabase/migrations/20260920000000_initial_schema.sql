-- ==============================================================================
-- MEMOIRE OS — COMPLETE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS & CORE TENANCY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'MEMOIRE',
    tagline VARCHAR(255) DEFAULT 'CRAFTING BRANDS',
    office_latitude NUMERIC(10, 6) DEFAULT 19.0760,
    office_longitude NUMERIC(10, 6) DEFAULT 72.9982,
    office_radius_meters INT DEFAULT 150,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. ROLES & PERMISSIONS (RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- FOUNDER, MASTER_ADMIN, HR, BDM, ACCOUNT_MANAGER, PROJECT_MANAGER, EMPLOYEE, FINANCE, TEAM_LEAD, CLIENT
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- 3. USERS (MAPPED TO SUPABASE AUTH & INTERNAL PROFILE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- References auth.users(id) in Supabase
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    department VARCHAR(100),
    designation VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    last_login TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. HRMS: DEPARTMENTS, DESIGNATIONS & EMPLOYEES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. MEM-101
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    reporting_manager VARCHAR(255),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    employment_status VARCHAR(50) NOT NULL DEFAULT 'Full-Time', -- Full-Time, Probation, Contract
    work_location VARCHAR(100) NOT NULL DEFAULT 'Navi Mumbai Office', -- Navi Mumbai Office, Remote, Hybrid
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    casual_leaves INT NOT NULL DEFAULT 12,
    sick_leaves INT NOT NULL DEFAULT 10,
    earned_leaves INT NOT NULL DEFAULT 15,
    monthly_rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. CLIENTS & CRM
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    logo TEXT,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, VIP, Prospect, Inactive
    annual_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    health_score INT NOT NULL DEFAULT 90,
    bdm VARCHAR(255),
    account_manager VARCHAR(255),
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    deleted_at TIMESTAMPTZ, -- Soft delete support
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SERVICES CATALOG & CLIENT SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- BRAND & CREATIVE, DIGITAL MARKETING, WEBSITE & TECHNOLOGY, ADVERTISING, CONTENT & PRODUCTION, PACKAGING & SPACE
    description TEXT,
    pricing_type VARCHAR(50) NOT NULL DEFAULT 'Retainer', -- Retainer, Project Based, Custom
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    active_projects_count INT NOT NULL DEFAULT 0,
    active_clients_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. LEADS & PIPELINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'Inbound Website',
    interested_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expected_closing DATE,
    assigned_bdm VARCHAR(255) NOT NULL DEFAULT 'Amit Patel',
    lead_score INT NOT NULL DEFAULT 75,
    status VARCHAR(50) NOT NULL DEFAULT 'New', -- New, Contacted, Qualified, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost, Follow Up
    notes TEXT,
    next_follow_up DATE,
    converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    activity_type VARCHAR(50) NOT NULL DEFAULT 'note', -- note, call, meeting, status_change, deal_won
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. OPERATIONS: PROJECTS & MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    project_manager VARCHAR(255) NOT NULL,
    team JSONB NOT NULL DEFAULT '[]'::jsonb,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Urgent
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress', -- Planning, In Progress, Review, Client Approval, Completed, On Hold
    progress INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 9. TASKS & DELIVERABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    assigned_to_avatar TEXT,
    assigned_by VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Urgent
    status VARCHAR(50) NOT NULL DEFAULT 'To Do', -- To Do, In Progress, Review, Completed, Blocked
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    actual_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    comments JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_client_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. ATTENDANCE & HOURS (WITH GEOFENCE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    punch_in_time VARCHAR(50) NOT NULL,
    punch_out_time VARCHAR(50),
    working_hours VARCHAR(50) DEFAULT '0h 0m',
    break_duration VARCHAR(50) DEFAULT '0m',
    location VARCHAR(255) DEFAULT 'Navi Mumbai HQ',
    gps_status VARCHAR(100) DEFAULT 'Geofence Verified (12m)',
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    work_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Present', -- Present, Late, Half Day, Absent, Leave, Weekend
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- ------------------------------------------------------------------------------
-- 11. LEAVES & WORK REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    leave_type VARCHAR(100) NOT NULL, -- Casual Leave, Sick Leave, Earned Leave, Half Day, Work From Home
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
    reviewed_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_slip_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    month VARCHAR(50) NOT NULL,
    year VARCHAR(10) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Requested', -- Requested, Processing, Ready, Rejected
    download_url TEXT,
    requested_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Daily', -- Daily, Weekly
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
    hours_worked NUMERIC(5, 2) NOT NULL DEFAULT 8,
    achievements TEXT NOT NULL,
    challenges TEXT,
    next_plan TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted', -- Submitted, Approved, Changes Requested
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. CONTENT POSTS (SOCIAL CALENDAR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- Instagram, Facebook, LinkedIn, YouTube, X
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    creative_url TEXT,
    scheduled_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CLIENT_REVIEW, APPROVED, REVISION, SCHEDULED, PUBLISHED
    hashtags TEXT,
    content_type VARCHAR(50) DEFAULT 'Static Post', -- Static Post, Reel, Story, Carousel
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. INTERNAL CHAT & NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_channels (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'channel', -- channel, direct, project
    description TEXT,
    unread_count INT NOT NULL DEFAULT 0,
    members JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(100) NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'System', -- Tasks, HR, CRM, Messages, System
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    timestamp VARCHAR(50) NOT NULL DEFAULT 'Just now',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. CALENDAR & MEETINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    client VARCHAR(255),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    meeting_link TEXT,
    meeting_type VARCHAR(50) NOT NULL DEFAULT 'Client Meeting', -- Client Meeting, Design Review, Sales Pitch, Internal
    created_by VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. FINANCE: INVOICES, PAYMENTS & REIMBURSEMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. MEM-INV-2026-082
    client_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Paid, Pending, Overdue
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
    reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Success',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_name VARCHAR(255) NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    project VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted', -- Submitted, Approved, Rejected, Paid
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. DOCUMENT VAULT (STORAGE REFERENCES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Employee Documents, Client Documents, Project Documents, Contracts, Proposals, Brand Assets
    size VARCHAR(50) NOT NULL DEFAULT '1.0 MB',
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    file_type VARCHAR(50) NOT NULL DEFAULT 'pdf', -- pdf, doc, png, figma, zip
    file_url TEXT,
    storage_path TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'internal', -- internal, client, public
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. SUPPORT TICKETS, VENDORS & ASSETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'High',
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, In Progress, Waiting, Resolved, Closed
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    monthly_payout NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 18. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, STATUS_CHANGE
    entity VARCHAR(100) NOT NULL, -- Lead, Client, Project, Task, Invoice, Document
    entity_id VARCHAR(255) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 19. AI & CALLING SYSTEM TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role VARCHAR(50) NOT NULL,
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    provider VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calling_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    total_leads INT NOT NULL DEFAULT 0,
    completed_calls INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES calling_campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Completed', -- Completed, Busy, No Answer, Failed
    duration INT NOT NULL DEFAULT 0,
    transcript TEXT,
    summary TEXT,
    recording_url TEXT,
    disposition VARCHAR(100) DEFAULT 'Interested', -- Interested, Not Interested, Callback, Converted
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated service role and fallback admin
CREATE POLICY "Allow all access to authenticated service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all access to clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all access to attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all access to leave_requests" ON leave_requests FOR ALL USING (true);
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all access to documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all access to chat_messages" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all access to audit_logs" ON audit_logs FOR ALL USING (true);

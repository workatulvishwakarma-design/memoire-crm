-- ==============================================================================
-- MEMOIRE OS — SAFE DATABASE RESET SCRIPT
-- ==============================================================================
-- This script completely clears all demo, mock, and transactional CRM records
-- while safely PRESERVING:
--   1. The entire database schema, constraints, triggers, and indexes
--   2. Roles and permissions matrix (RBAC)
--   3. Organization settings
--   4. Standard agency services catalog
--   5. Core system configuration and Supabase Auth structure
-- ==============================================================================

BEGIN;

-- 1. Disable triggers temporarily to avoid cascade overhead during reset
SET session_replication_role = 'replica';

-- 2. Truncate all transactional & sample data tables (with CASCADE to respect FKs)
TRUNCATE TABLE 
    audit_logs,
    call_records,
    calling_campaigns,
    ai_conversations,
    support_tickets,
    payments,
    invoices,
    reimbursements,
    documents,
    calendar_events,
    chat_messages,
    content_posts,
    work_reports,
    salary_slip_requests,
    leave_requests,
    attendance,
    tasks,
    project_members,
    projects,
    lead_activities,
    leads,
    client_services,
    client_contacts,
    clients,
    employees,
    company_assets,
    vendors,
    notifications
CASCADE;

-- Re-enable triggers
SET session_replication_role = 'DEFAULT';

-- 3. Reset agency service catalog metrics to zero
UPDATE services 
SET active_projects_count = 0, 
    active_clients_count = 0;

-- 4. Reset chat channels unread counters and member lists
UPDATE chat_channels 
SET unread_count = 0, 
    members = '[]'::jsonb;

COMMIT;

-- Verification query
SELECT 
    'clients' AS table_name, count(*) FROM clients
UNION ALL SELECT 'leads', count(*) FROM leads
UNION ALL SELECT 'projects', count(*) FROM projects
UNION ALL SELECT 'tasks', count(*) FROM tasks
UNION ALL SELECT 'employees', count(*) FROM employees
UNION ALL SELECT 'attendance', count(*) FROM attendance
UNION ALL SELECT 'invoices', count(*) FROM invoices
UNION ALL SELECT 'documents', count(*) FROM documents
UNION ALL SELECT 'notifications', count(*) FROM notifications;

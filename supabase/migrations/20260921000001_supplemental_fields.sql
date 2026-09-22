-- ==============================================================================
-- MEMOIRE OS — SUPPLEMENTAL MIGRATION 001
-- Adds selfie URL columns to attendance, additional JSONB columns to employees
-- Run this after the initial schema migration
-- ==============================================================================

-- Attendance: Add selfie URL columns for punch-in and punch-out photos
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS selfie_out_url TEXT;

-- Attendance: Add accuracy column
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gps_accuracy NUMERIC(8, 2);

-- Vendors: Add notes column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes TEXT;

-- Employees: Add extended personal/payroll fields
ALTER TABLE employees ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS blood_group VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'EMPLOYEE';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_details JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS login_credentials JSONB;

-- Content posts: ensure updated_at is correctly tracked
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Calendar events: add attendees
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS attendees JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Work reports: add feedback column
ALTER TABLE work_reports ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Reimbursements: add receipt_url
ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);
ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Documents: add download tracking
ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_count INT NOT NULL DEFAULT 0;

-- RLS for new tables (vendors was missing)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all access to vendors" ON vendors FOR ALL USING (true);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_employee ON work_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);

-- ==============================================================================
-- MEMOIRE OS — SEED DATA
-- ==============================================================================

-- 1. Organizations
INSERT INTO organizations (name, tagline, office_latitude, office_longitude, office_radius_meters)
VALUES ('MEMOIRE', 'CRAFTING BRANDS', 19.0760, 72.9982, 150)
ON CONFLICT DO NOTHING;

-- 2. Roles
INSERT INTO roles (name, description) VALUES
('FOUNDER', 'Founder & CEO with unrestricted agency governance'),
('MASTER_ADMIN', 'Agency System Administrator with complete module control'),
('HR', 'Head of Human Resources, People Operations and Payroll'),
('BDM', 'Business Development Manager and Inbound Sales Specialist'),
('ACCOUNT_MANAGER', 'Client Partner and Account Strategy Lead'),
('PROJECT_MANAGER', 'Operations, Sprint Delivery and Resource Planning Lead'),
('EMPLOYEE', 'Agency Creative / Specialist (Copy, Design, Performance, Dev)'),
('FINANCE', 'Finance, Retainer Billing, Expense and Taxation Lead'),
('TEAM_LEAD', 'Specialist Lead and Quality Reviewer'),
('CLIENT', 'Client Executive Portal User')
ON CONFLICT (name) DO NOTHING;

-- 3. Services Catalog
INSERT INTO services (name, category, description, pricing_type, base_price, active_projects_count, active_clients_count) VALUES
('Brand Strategy & Positioning', 'BRAND & CREATIVE', 'Comprehensive brand audits, archetype mapping, mission, vision, and core narrative design.', 'Project Based', 450000, 3, 2),
('Visual Identity & Design System', 'BRAND & CREATIVE', 'Logo systems, bespoke typography, color harmony tokens, brand guidelines and stationary.', 'Project Based', 350000, 4, 3),
('Performance Marketing Retainer', 'DIGITAL MARKETING', 'Meta Ads, Google Search & PMax, TikTok/Snapchat campaigns with creative testing sprints.', 'Retainer', 250000, 5, 4),
('Full-Stack Web Development', 'WEBSITE & TECHNOLOGY', 'High-speed Next.js/React web platforms, headless CMS, API architectures, and conversion UI.', 'Project Based', 600000, 2, 2),
('Social Media & Content Engine', 'CONTENT & PRODUCTION', 'Monthly content calendar, Reels production, static carousels, and community management.', 'Retainer', 180000, 6, 4),
('Packaging & Retail Shelf Design', 'PACKAGING & SPACE', '3D renders, structural packaging die-lines, FMCG label design compliant with regulations.', 'Project Based', 300000, 1, 1)
ON CONFLICT DO NOTHING;

-- 4. Initial Clients
INSERT INTO clients (company_name, logo, industry, website, location, status, annual_value, health_score, bdm, account_manager, services, joined_date, notes) VALUES
('UrbanNest Realty', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80', 'Real Estate & Luxury Housing', 'https://urbannest.in', 'Navi Mumbai & Thane', 'Active', 1800000, 95, 'Amit Patel', 'Rohan Mehta', '["Brand Strategy", "Performance Marketing", "Content Engine"]'::jsonb, '2026-01-15', 'Key real estate retainer. Quarterly Tower A launch campaigns.'),
('Aarav Foods', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&auto=format&fit=crop&q=80', 'FMCG & Organic Snacks', 'https://aaravfoods.com', 'Kochi & Mumbai', 'Active', 1200000, 88, 'Amit Patel', 'Sneha Kulkarni', '["Packaging Design", "Performance Marketing"]'::jsonb, '2026-03-01', 'Healthy snacking D2C brand scaling into modern trade.'),
('Bombay Spice Co.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=120&auto=format&fit=crop&q=80', 'Spices & Export Goods', 'https://bombayspice.co.in', 'Mumbai & Dubai', 'VIP', 2400000, 92, 'Amit Patel', 'Rohan Mehta', '["Brand Identity", "Full-Stack Web Development"]'::jsonb, '2025-11-10', 'B2B export leader. Rebranding European export line.')
ON CONFLICT DO NOTHING;

-- 5. Chat Channels
INSERT INTO chat_channels (id, name, type, description, unread_count, members) VALUES
('ch-general', '# general', 'channel', 'Company-wide announcements and general agency chatter', 0, '["Rahul Sharma", "Priya Nair", "Amit Patel", "Sneha Kulkarni"]'::jsonb),
('ch-creative', '# creative-reviews', 'channel', 'Brand guidelines, moodboards, copy feedback, and Figma drops', 2, '["Sneha Kulkarni", "Vikram Singh", "Ananya Iyer"]'::jsonb),
('ch-leads', '# sales-pipeline', 'channel', 'BDM inbound lead alerts, high-ticket conversions, and client proposals', 1, '["Amit Patel", "Rahul Sharma"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

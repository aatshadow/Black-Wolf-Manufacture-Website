-- ============================================================================
-- KEA (Knowledge Extraction Agent) — Complete Database Schema
-- Version 1.0 — March 2026
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  industry text NOT NULL DEFAULT 'manufacturing',
  language text NOT NULL DEFAULT 'en',
  logo_url text,
  settings jsonb NOT NULL DEFAULT '{}',
  subscription_tier text NOT NULL DEFAULT 'starter',
  active_template_id uuid, -- FK added after templates table
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

-- ============================================================================
-- 2. USER PROFILES (extends auth.users)
-- ============================================================================
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'consultant', 'domain_expert', 'manager', 'viewer')),
  track_access text[] NOT NULL DEFAULT '{}',
  avatar_url text,
  language text NOT NULL DEFAULT 'en',
  last_session_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================================================
-- 3. TEMPLATES
-- ============================================================================
CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  industry text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_public boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES user_profiles(id),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_templates_org ON templates(organization_id);

-- Now add the FK from organizations to templates
ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_active_template
  FOREIGN KEY (active_template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. TRACKS
-- ============================================================================
CREATE TABLE tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  bot_personality text NOT NULL DEFAULT '',
  conversation_style text NOT NULL DEFAULT 'open_ended'
    CHECK (conversation_style IN ('open_ended', 'guided')),
  target_role text NOT NULL DEFAULT 'general'
    CHECK (target_role IN ('domain_expert', 'manager', 'accountant', 'logistics', 'general')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracks_template ON tracks(template_id);

-- ============================================================================
-- 5. SCHEMA BLOCKS
-- ============================================================================
CREATE TABLE schema_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  is_repeatable boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_schema_blocks_track ON schema_blocks(track_id);

-- ============================================================================
-- 6. SCHEMA FIELDS
-- ============================================================================
CREATE TABLE schema_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES schema_blocks(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  field_type text NOT NULL DEFAULT 'text'
    CHECK (field_type IN ('text', 'number', 'boolean', 'select', 'multi_select', 'json', 'file', 'date')),
  description text,
  question_hint text,
  is_required boolean NOT NULL DEFAULT false,
  is_bot_critical boolean NOT NULL DEFAULT false,
  validation_rules jsonb NOT NULL DEFAULT '{}',
  depends_on jsonb,
  default_value text,
  display_order integer NOT NULL DEFAULT 0,
  group_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_schema_fields_block ON schema_fields(block_id);

-- ============================================================================
-- 7. SESSIONS
-- ============================================================================
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  track_id uuid NOT NULL REFERENCES tracks(id),
  title text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused')),
  summary text,
  structured_summary jsonb,
  fields_covered uuid[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_org ON sessions(organization_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_track ON sessions(track_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- ============================================================================
-- 8. MESSAGES
-- ============================================================================
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  extracted_fields jsonb,
  has_files boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_org ON messages(organization_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================================
-- 9. EXTRACTION INSTANCES
-- ============================================================================
CREATE TABLE extraction_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  block_id uuid NOT NULL REFERENCES schema_blocks(id) ON DELETE CASCADE,
  instance_label text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  completeness_pct numeric(5,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'pending_review', 'confirmed', 'needs_clarification')),
  confirmed_by uuid REFERENCES user_profiles(id),
  confirmed_at timestamptz,
  source_messages uuid[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_extraction_org ON extraction_instances(organization_id);
CREATE INDEX idx_extraction_block ON extraction_instances(block_id);
CREATE INDEX idx_extraction_status ON extraction_instances(status);

-- ============================================================================
-- 10. EXTRACTION HISTORY (audit trail)
-- ============================================================================
CREATE TABLE extraction_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES extraction_instances(id) ON DELETE CASCADE,
  field_code text NOT NULL,
  old_value text,
  new_value text,
  source text NOT NULL CHECK (source IN ('bot_extraction', 'user_correction', 'consultant_edit')),
  source_message_id uuid REFERENCES messages(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_extraction_history_instance ON extraction_history(instance_id);

-- ============================================================================
-- 11. FILES
-- ============================================================================
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id uuid REFERENCES messages(id),
  instance_id uuid REFERENCES extraction_instances(id),
  filename text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_org ON files(organization_id);
CREATE INDEX idx_files_message ON files(message_id);

-- ============================================================================
-- 12. PROGRESS SNAPSHOTS
-- ============================================================================
CREATE TABLE progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES tracks(id),
  block_id uuid REFERENCES schema_blocks(id),
  completeness_pct numeric(5,2) NOT NULL,
  fields_total integer NOT NULL,
  fields_filled integer NOT NULL,
  fields_confirmed integer NOT NULL DEFAULT 0,
  snapshot_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_org ON progress_snapshots(organization_id);
CREATE INDEX idx_progress_date ON progress_snapshots(snapshot_date);

-- ============================================================================
-- 13. ALERTS
-- ============================================================================
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL
    CHECK (type IN ('contradiction', 'gap', 'stale_data', 'user_correction', 'follow_up_needed')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  related_instances uuid[] NOT NULL DEFAULT '{}',
  related_messages uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  resolved_by uuid REFERENCES user_profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_org ON alerts(organization_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ============================================================================
-- 14. INJECTED QUESTIONS
-- ============================================================================
CREATE TABLE injected_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES tracks(id),
  target_user_id uuid REFERENCES user_profiles(id),
  question text NOT NULL,
  context text,
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_field_id uuid REFERENCES schema_fields(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'asked', 'answered', 'cancelled')),
  asked_in_message_id uuid REFERENCES messages(id),
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_injected_org ON injected_questions(organization_id);
CREATE INDEX idx_injected_status ON injected_questions(status);

-- ============================================================================
-- 15. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Helper function: get current user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE injected_questions ENABLE ROW LEVEL SECURITY;

-- Organizations: users can only see their own org
CREATE POLICY "Users see own org" ON organizations
  FOR SELECT USING (id = get_user_org_id());

CREATE POLICY "Admins update own org" ON organizations
  FOR UPDATE USING (id = get_user_org_id() AND get_user_role() = 'admin');

-- User profiles: users see profiles in their org
CREATE POLICY "Users see org profiles" ON user_profiles
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins manage profiles" ON user_profiles
  FOR ALL USING (organization_id = get_user_org_id() AND get_user_role() = 'admin');

-- Templates: org-scoped + public templates
CREATE POLICY "Users see org or public templates" ON templates
  FOR SELECT USING (organization_id = get_user_org_id() OR is_public = true);

CREATE POLICY "Admins/consultants manage templates" ON templates
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'consultant')
  );

-- Tracks: through templates
CREATE POLICY "Users see tracks" ON tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = tracks.template_id
      AND (t.organization_id = get_user_org_id() OR t.is_public = true)
    )
  );

CREATE POLICY "Admins/consultants manage tracks" ON tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = tracks.template_id
      AND t.organization_id = get_user_org_id()
      AND get_user_role() IN ('admin', 'consultant')
    )
  );

-- Schema blocks: through tracks
CREATE POLICY "Users see blocks" ON schema_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tracks tr
      JOIN templates t ON t.id = tr.template_id
      WHERE tr.id = schema_blocks.track_id
      AND (t.organization_id = get_user_org_id() OR t.is_public = true)
    )
  );

CREATE POLICY "Admins/consultants manage blocks" ON schema_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tracks tr
      JOIN templates t ON t.id = tr.template_id
      WHERE tr.id = schema_blocks.track_id
      AND t.organization_id = get_user_org_id()
      AND get_user_role() IN ('admin', 'consultant')
    )
  );

-- Schema fields: through blocks
CREATE POLICY "Users see fields" ON schema_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM schema_blocks sb
      JOIN tracks tr ON tr.id = sb.track_id
      JOIN templates t ON t.id = tr.template_id
      WHERE sb.id = schema_fields.block_id
      AND (t.organization_id = get_user_org_id() OR t.is_public = true)
    )
  );

CREATE POLICY "Admins/consultants manage fields" ON schema_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schema_blocks sb
      JOIN tracks tr ON tr.id = sb.track_id
      JOIN templates t ON t.id = tr.template_id
      WHERE sb.id = schema_fields.block_id
      AND t.organization_id = get_user_org_id()
      AND get_user_role() IN ('admin', 'consultant')
    )
  );

-- Sessions: org-scoped, users see their own or admins/consultants see all
CREATE POLICY "Users see own sessions" ON sessions
  FOR SELECT USING (
    organization_id = get_user_org_id()
    AND (user_id = auth.uid() OR get_user_role() IN ('admin', 'consultant'))
  );

CREATE POLICY "Users create sessions" ON sessions
  FOR INSERT WITH CHECK (organization_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users update own sessions" ON sessions
  FOR UPDATE USING (organization_id = get_user_org_id() AND user_id = auth.uid());

-- Messages: org-scoped
CREATE POLICY "Users see org messages" ON messages
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Users create messages" ON messages
  FOR INSERT WITH CHECK (organization_id = get_user_org_id());

-- Extraction instances: org-scoped
CREATE POLICY "Users see org extractions" ON extraction_instances
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Admins/consultants manage extractions" ON extraction_instances
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'consultant')
  );

-- Extraction history: through instances
CREATE POLICY "Users see extraction history" ON extraction_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM extraction_instances ei
      WHERE ei.id = extraction_history.instance_id
      AND ei.organization_id = get_user_org_id()
    )
  );

-- Files: org-scoped
CREATE POLICY "Users see org files" ON files
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Users upload files" ON files
  FOR INSERT WITH CHECK (organization_id = get_user_org_id());

-- Progress snapshots: org-scoped
CREATE POLICY "Users see org progress" ON progress_snapshots
  FOR SELECT USING (organization_id = get_user_org_id());

-- Alerts: org-scoped
CREATE POLICY "Users see org alerts" ON alerts
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Admins/consultants manage alerts" ON alerts
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'consultant')
  );

-- Injected questions: org-scoped
CREATE POLICY "Users see org questions" ON injected_questions
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Admins/consultants manage questions" ON injected_questions
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'consultant')
  );

-- ============================================================================
-- 16. UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_templates
  BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_extraction_instances
  BEFORE UPDATE ON extraction_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 17. SEED: DEFAULT FURNITURE MANUFACTURING TEMPLATE
-- ============================================================================

-- Create a global template (no org_id, public)
INSERT INTO templates (id, name, description, industry, is_public)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ERP Discovery — Furniture Manufacturing',
  'Complete ERP discovery template for furniture manufacturing businesses. Covers product families, materials, production processes, and all management operations.',
  'furniture_manufacturing',
  true
);

-- Track A — Production & Product
INSERT INTO tracks (id, template_id, name, code, description, bot_personality, conversation_style, target_role, display_order)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Production & Product',
  'track_a',
  'Deep knowledge extraction about products, materials, production processes, machines, and quality standards.',
  'You are KEA, an AI discovery assistant. Your role is to learn everything about how a manufacturing business designs, produces, and delivers its products. You act as an intelligent apprentice — curious, patient, thorough, and genuinely fascinated by craftsmanship and process. You are warm and respectful. You admire the expert''s knowledge and experience. You never rush. When something is complex, you take time to understand it. You reformulate what you learn to confirm understanding. You identify gaps proactively. You keep track of what you''ve learned and what''s still missing.',
  'open_ended',
  'domain_expert',
  0
);

-- Track B — Management & Operations
INSERT INTO tracks (id, template_id, name, code, description, bot_personality, conversation_style, target_role, display_order)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Management & Operations',
  'track_b',
  'Structured discovery of commercial operations, finances, logistics, and administration.',
  'You are KEA, an AI business discovery consultant. Your role is to understand how this organization manages its commercial operations, finances, logistics, and administration. You are professional and efficient. You respect the user''s time. You understand business operations and can suggest common patterns. You work through topics systematically. When you detect common patterns, you offer them as options to save time.',
  'guided',
  'manager',
  1
);

-- ============================================================
-- Track A Blocks
-- ============================================================

-- Block: Product Families
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010',
  'Product Families', 'product_families',
  'Complete description of each product family manufactured, including variants, dimensions, materials, and rules.',
  true, 0, 'Boxes');

-- Block: Parts Anatomy
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010',
  'Parts Anatomy', 'parts_anatomy',
  'Detailed breakdown of individual parts/components that make up products.',
  true, 1, 'Puzzle');

-- Block: Materials Catalog
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010',
  'Materials Catalog', 'materials_catalog',
  'All materials used in production: boards, edge banding, hardware, finishes, etc.',
  true, 2, 'Layers');

-- Block: Production Process
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010',
  'Production Process', 'production_process',
  'Step-by-step production workflow from order to delivery.',
  true, 3, 'Workflow');

-- Block: Machines & Equipment
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010',
  'Machines & Equipment', 'machines_equipment',
  'All machines, tools, and equipment used in the factory.',
  true, 4, 'Cog');

-- Block: Quality Rules
INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010',
  'Quality Rules', 'quality_rules',
  'Quality standards, tolerance rules, inspection points, and defect handling.',
  false, 5, 'ShieldCheck');

-- ============================================================
-- Track B Blocks
-- ============================================================

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000020',
  'Sales Process', 'sales_process',
  'Sales channels, quoting, order flow, payment, invoicing, and returns.',
  false, 0, 'ShoppingCart');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000020',
  'Purchasing', 'purchasing',
  'Supplier management, purchase orders, payment terms, quality reception.',
  false, 1, 'PackageSearch');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000020',
  'Logistics', 'logistics',
  'Delivery planning, transport management, route optimization, client notifications.',
  false, 2, 'Truck');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000020',
  'Finance & Accounting', 'finance',
  'Chart of accounts, banking, cash flow, tax reporting, accounting software integration.',
  false, 3, 'Calculator');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000020',
  'Warehouse Operations', 'warehouse',
  'Stock nomenclature, operations, transfers, min/max levels, inventory management.',
  false, 4, 'Warehouse');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000020',
  'Users & Roles', 'users_roles',
  'Role definitions, access levels, approval workflows within the organization.',
  false, 5, 'Users');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000020',
  'IT Infrastructure', 'it_infrastructure',
  'Current software, hardware, connectivity, and integration needs.',
  false, 6, 'Server');

INSERT INTO schema_blocks (id, track_id, name, code, description, is_repeatable, display_order, icon)
VALUES ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000020',
  'Data Migration', 'data_migration',
  'Existing data sources, formats, volumes, priority, and cleanup needs.',
  false, 7, 'DatabaseZap');

-- ============================================================
-- SEED FIELDS — Track A: Product Families
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000100', 'Family Name', 'family_name', 'text', 'Name of the product family', 'What do you call this type of furniture?', true, true, 0, 'Identity'),
('00000000-0000-0000-0000-000000000100', 'Family Code', 'family_code', 'text', 'Internal code for this family', 'Do you have an internal code or abbreviation for this family?', false, false, 1, 'Identity'),
('00000000-0000-0000-0000-000000000100', 'Description', 'description', 'text', 'General description of the family', 'Can you describe this family in a few sentences?', true, false, 2, 'Identity'),
('00000000-0000-0000-0000-000000000100', 'Subfamilies', 'subfamilies', 'json', 'List of subfamilies or variants', 'Are there sub-types or variants within this family?', true, true, 3, 'Identity'),
('00000000-0000-0000-0000-000000000100', 'Typical Dimensions', 'typical_dimensions', 'json', 'Standard dimension ranges (H x W x D)', 'What are the typical dimensions for this family?', true, false, 4, 'Dimensions'),
('00000000-0000-0000-0000-000000000100', 'Variable Dimensions', 'variable_dimensions', 'json', 'Which dimensions are customizable by the client', 'Which dimensions can the customer choose or customize?', true, true, 5, 'Dimensions'),
('00000000-0000-0000-0000-000000000100', 'Dimension Constraints', 'dimension_constraints', 'json', 'Min/max limits for variable dimensions', 'Are there minimum or maximum limits for those dimensions?', true, false, 6, 'Dimensions'),
('00000000-0000-0000-0000-000000000100', 'Primary Materials', 'primary_materials', 'multi_select', 'Main materials used', 'What are the main materials used in this family?', true, true, 7, 'Materials'),
('00000000-0000-0000-0000-000000000100', 'Material Options', 'material_options', 'json', 'Which materials can the client choose from', 'Can the customer choose different materials or finishes?', true, false, 8, 'Materials'),
('00000000-0000-0000-0000-000000000100', 'Hardware List', 'hardware_list', 'json', 'Standard hardware components', 'What hardware goes into this family? Hinges, handles, slides?', true, false, 9, 'Materials'),
('00000000-0000-0000-0000-000000000100', 'Hardware Options', 'hardware_options', 'json', 'Optional or upgradeable hardware', 'Are there premium hardware options the client can choose?', false, false, 10, 'Materials'),
('00000000-0000-0000-0000-000000000100', 'Edge Banding', 'edge_banding', 'json', 'Edge banding specifications', 'What edge banding do you use for this family?', false, false, 11, 'Materials'),
('00000000-0000-0000-0000-000000000100', 'Assembly Method', 'assembly_method', 'select', 'How the product is assembled', 'How is this family assembled? Flat-pack, pre-assembled, or mixed?', true, false, 12, 'Production'),
('00000000-0000-0000-0000-000000000100', 'Production Time', 'production_time', 'text', 'Typical production time per unit', 'How long does it typically take to produce one unit?', true, false, 13, 'Production'),
('00000000-0000-0000-0000-000000000100', 'Complexity Rating', 'complexity_rating', 'select', 'Production complexity: low, medium, high', 'Would you rate this family as simple, medium, or complex to produce?', false, false, 14, 'Production'),
('00000000-0000-0000-0000-000000000100', 'Price Range', 'price_range', 'text', 'Typical price range', 'What is the typical price range for this family?', false, false, 15, 'Commercial'),
('00000000-0000-0000-0000-000000000100', 'Best Sellers', 'best_sellers', 'json', 'Most popular configurations', 'Which configurations or variants sell the most?', false, false, 16, 'Commercial'),
('00000000-0000-0000-0000-000000000100', 'Incompatibilities', 'incompatibilities', 'json', 'Material/hardware combinations that do not work', 'Are there any combinations that do not work together?', true, false, 17, 'Rules'),
('00000000-0000-0000-0000-000000000100', 'Parametric Rules', 'parametric_rules', 'json', 'Rules that change parts based on dimensions', 'Do any parts change depending on the chosen dimensions?', true, false, 18, 'Rules'),
('00000000-0000-0000-0000-000000000100', 'Special Requirements', 'special_requirements', 'text', 'Any unique production requirements', 'Is there anything unusual or special about producing this family?', false, false, 19, 'Rules'),
('00000000-0000-0000-0000-000000000100', 'Quality Checks', 'quality_checks', 'json', 'Specific quality checks for this family', 'What quality checks do you perform specifically for this family?', false, false, 20, 'Rules'),
('00000000-0000-0000-0000-000000000100', 'Photos', 'photos', 'file', 'Product photos or technical drawings', 'Can you share photos or technical drawings of this family?', false, false, 21, 'Documentation'),
('00000000-0000-0000-0000-000000000100', 'Technical Drawings', 'technical_drawings', 'file', 'CAD files or technical specifications', 'Do you have CAD files or technical specs you can share?', false, false, 22, 'Documentation'),
('00000000-0000-0000-0000-000000000100', 'Notes', 'notes', 'text', 'Additional notes about this family', NULL, false, false, 23, 'Documentation');

-- ============================================================
-- SEED FIELDS — Track A: Parts Anatomy
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000101', 'Part Name', 'part_name', 'text', 'Name of the part/component', 'What is this part called?', true, true, 0, 'Identity'),
('00000000-0000-0000-0000-000000000101', 'Part Code', 'part_code', 'text', 'Internal code', NULL, false, false, 1, 'Identity'),
('00000000-0000-0000-0000-000000000101', 'Part Type', 'part_type', 'select', 'Fixed, optional, or conditional', 'Is this part always present, optional, or depends on configuration?', true, true, 2, 'Identity'),
('00000000-0000-0000-0000-000000000101', 'Material', 'material', 'text', 'What material this part is made of', 'What material is this part made from?', true, false, 3, 'Specs'),
('00000000-0000-0000-0000-000000000101', 'Thickness', 'thickness', 'number', 'Material thickness in mm', 'What thickness is the board for this part?', true, false, 4, 'Specs'),
('00000000-0000-0000-0000-000000000101', 'Dimension Formula Width', 'dim_formula_w', 'text', 'How width is calculated from parent dimensions', 'How do you calculate the width of this part from the overall dimensions?', true, false, 5, 'Dimensions'),
('00000000-0000-0000-0000-000000000101', 'Dimension Formula Height', 'dim_formula_h', 'text', 'How height is calculated', 'And the height?', true, false, 6, 'Dimensions'),
('00000000-0000-0000-0000-000000000101', 'Dimension Formula Depth', 'dim_formula_d', 'text', 'How depth is calculated', 'And the depth?', false, false, 7, 'Dimensions'),
('00000000-0000-0000-0000-000000000101', 'Edge Banding Config', 'edge_banding_config', 'json', 'Which edges get banding (top, bottom, left, right)', 'Which edges of this part get edge banding?', false, false, 8, 'Finishing'),
('00000000-0000-0000-0000-000000000101', 'Machining Operations', 'machining_ops', 'json', 'Drilling, routing, cutting operations needed', 'What machining operations does this part need?', true, false, 9, 'Production'),
('00000000-0000-0000-0000-000000000101', 'Hardware Attachments', 'hardware_attachments', 'json', 'Hardware mounted on this part', 'What hardware gets attached to this part?', false, false, 10, 'Production'),
('00000000-0000-0000-0000-000000000101', 'Grain Direction', 'grain_direction', 'select', 'Required grain direction: horizontal, vertical, any', 'Does the grain direction matter for this part?', false, false, 11, 'Finishing'),
('00000000-0000-0000-0000-000000000101', 'Quantity Per Unit', 'quantity', 'number', 'How many of this part per product unit', 'How many of this part go into one finished product?', true, false, 12, 'Identity'),
('00000000-0000-0000-0000-000000000101', 'Conditional Logic', 'conditional_logic', 'json', 'When this part is included/excluded', 'Under what conditions is this part included or excluded?', false, false, 13, 'Rules'),
('00000000-0000-0000-0000-000000000101', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 14, NULL);

-- ============================================================
-- SEED FIELDS — Track A: Materials Catalog
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000102', 'Material Name', 'material_name', 'text', 'Name of the material', 'What is this material called?', true, true, 0, 'Identity'),
('00000000-0000-0000-0000-000000000102', 'Material Type', 'material_type', 'select', 'Category: board, edge, hardware, finish, accessory', 'What type of material is this?', true, true, 1, 'Identity'),
('00000000-0000-0000-0000-000000000102', 'Supplier', 'supplier', 'text', 'Primary supplier', 'Who supplies this material?', true, false, 2, 'Supply'),
('00000000-0000-0000-0000-000000000102', 'Supplier Code', 'supplier_code', 'text', 'Supplier reference code', 'What is the supplier code or reference?', false, false, 3, 'Supply'),
('00000000-0000-0000-0000-000000000102', 'Standard Dimensions', 'standard_dimensions', 'json', 'Standard sheet/piece dimensions', 'What are the standard dimensions this material comes in?', true, false, 4, 'Specs'),
('00000000-0000-0000-0000-000000000102', 'Available Thicknesses', 'thicknesses', 'json', 'Available thickness options', 'What thicknesses are available?', false, false, 5, 'Specs'),
('00000000-0000-0000-0000-000000000102', 'Colors/Finishes', 'colors_finishes', 'json', 'Available color and finish options', 'What colors or finishes does this material come in?', false, false, 6, 'Specs'),
('00000000-0000-0000-0000-000000000102', 'Unit Price', 'unit_price', 'number', 'Price per unit/sheet/meter', 'What is the price per unit?', false, false, 7, 'Commercial'),
('00000000-0000-0000-0000-000000000102', 'Price Unit', 'price_unit', 'select', 'Unit of pricing: per_sheet, per_meter, per_kg, per_piece', 'Is that price per sheet, per meter, or per piece?', false, false, 8, 'Commercial'),
('00000000-0000-0000-0000-000000000102', 'Min Stock Level', 'min_stock', 'number', 'Minimum stock to maintain', 'What minimum stock level do you maintain?', false, false, 9, 'Inventory'),
('00000000-0000-0000-0000-000000000102', 'Lead Time Days', 'lead_time_days', 'number', 'Supplier delivery time in days', 'How many days does it take to receive from supplier?', false, false, 10, 'Supply'),
('00000000-0000-0000-0000-000000000102', 'Compatibility Notes', 'compatibility', 'text', 'What products/parts this material works with', 'Which products or parts is this material used for?', false, false, 11, 'Rules'),
('00000000-0000-0000-0000-000000000102', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 12, NULL);

-- ============================================================
-- SEED FIELDS — Track A: Production Process
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000103', 'Step Name', 'step_name', 'text', 'Name of the production step', 'What is this production step called?', true, true, 0, 'Identity'),
('00000000-0000-0000-0000-000000000103', 'Step Order', 'step_order', 'number', 'Sequence position', 'Where does this step fall in the sequence?', true, false, 1, 'Identity'),
('00000000-0000-0000-0000-000000000103', 'Description', 'description', 'text', 'What happens in this step', 'Can you describe what happens during this step?', true, false, 2, 'Identity'),
('00000000-0000-0000-0000-000000000103', 'Machine Used', 'machine', 'text', 'Which machine performs this step', 'Which machine or equipment is used?', true, false, 3, 'Execution'),
('00000000-0000-0000-0000-000000000103', 'Operator Skill', 'operator_skill', 'select', 'Required skill level: basic, intermediate, expert', 'What skill level does the operator need?', false, false, 4, 'Execution'),
('00000000-0000-0000-0000-000000000103', 'Time Per Unit', 'time_per_unit', 'text', 'Average time to process one unit', 'How long does this step take per unit?', true, false, 5, 'Execution'),
('00000000-0000-0000-0000-000000000103', 'Inputs', 'inputs', 'json', 'What goes into this step', 'What goes into this step? Parts, materials?', true, false, 6, 'Flow'),
('00000000-0000-0000-0000-000000000103', 'Outputs', 'outputs', 'json', 'What comes out of this step', 'What comes out of this step?', true, false, 7, 'Flow'),
('00000000-0000-0000-0000-000000000103', 'Quality Checks', 'quality_checks', 'json', 'Quality checks at this step', 'Are there quality checks at this step?', false, false, 8, 'Quality'),
('00000000-0000-0000-0000-000000000103', 'Common Defects', 'common_defects', 'json', 'Typical problems at this step', 'What problems commonly occur at this step?', false, false, 9, 'Quality'),
('00000000-0000-0000-0000-000000000103', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 10, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Sales Process
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000200', 'Sales Channels', 'sales_channels', 'multi_select', 'How customers reach you', 'How do customers find and reach you?', true, true, 0, 'Channels'),
('00000000-0000-0000-0000-000000000200', 'Showroom', 'has_showroom', 'boolean', 'Do you have a physical showroom?', 'Do you have a physical showroom?', true, false, 1, 'Channels'),
('00000000-0000-0000-0000-000000000200', 'Online Presence', 'online_presence', 'json', 'Website, social media, marketplaces', 'What is your online presence? Website, social media?', false, false, 2, 'Channels'),
('00000000-0000-0000-0000-000000000200', 'Quote Process', 'quote_process', 'text', 'How quotes are created and sent', 'Walk me through how you create and send a quote to a customer.', true, true, 3, 'Order Flow'),
('00000000-0000-0000-0000-000000000200', 'Quote Tools', 'quote_tools', 'text', 'Software or tools used for quoting', 'What tools or software do you use to create quotes?', true, false, 4, 'Order Flow'),
('00000000-0000-0000-0000-000000000200', 'Order Confirmation', 'order_confirmation', 'text', 'How an order gets confirmed', 'How does a quote become a confirmed order?', true, false, 5, 'Order Flow'),
('00000000-0000-0000-0000-000000000200', 'Payment Methods', 'payment_methods', 'multi_select', 'Accepted payment methods', 'What payment methods do you accept?', true, false, 6, 'Payments'),
('00000000-0000-0000-0000-000000000200', 'Payment Terms', 'payment_terms', 'text', 'Standard payment terms', 'What are your standard payment terms? Deposit, installments?', true, false, 7, 'Payments'),
('00000000-0000-0000-0000-000000000200', 'Invoice Process', 'invoice_process', 'text', 'How invoices are generated', 'How do you generate and send invoices?', true, false, 8, 'Payments'),
('00000000-0000-0000-0000-000000000200', 'Returns Policy', 'returns_policy', 'text', 'How returns and complaints are handled', 'How do you handle returns or complaints?', false, false, 9, 'After Sale'),
('00000000-0000-0000-0000-000000000200', 'Warranty', 'warranty', 'text', 'Warranty terms offered', 'What warranty do you offer on your products?', false, false, 10, 'After Sale'),
('00000000-0000-0000-0000-000000000200', 'Customer Tracking', 'customer_tracking', 'text', 'How customer info is stored and managed', 'How do you keep track of customer information?', false, false, 11, 'CRM'),
('00000000-0000-0000-0000-000000000200', 'Sales Volume', 'sales_volume', 'text', 'Typical monthly/yearly order volume', 'What is your typical order volume per month?', false, false, 12, 'Metrics'),
('00000000-0000-0000-0000-000000000200', 'Notes', 'notes', 'text', 'Additional notes about sales', NULL, false, false, 13, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Finance & Accounting
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000203', 'Accounting Software', 'accounting_software', 'text', 'Current accounting software', 'What accounting software do you use?', true, true, 0, 'Current System'),
('00000000-0000-0000-0000-000000000203', 'Chart of Accounts', 'chart_of_accounts', 'text', 'Structure of chart of accounts', 'Can you describe your chart of accounts structure?', true, false, 1, 'Current System'),
('00000000-0000-0000-0000-000000000203', 'Bank Accounts', 'bank_accounts', 'json', 'Business bank accounts', 'How many bank accounts does the business have?', true, false, 2, 'Banking'),
('00000000-0000-0000-0000-000000000203', 'Bank Integration', 'bank_integration', 'boolean', 'Bank feeds/integration exists?', 'Do you have bank feeds integrated with your accounting?', false, false, 3, 'Banking'),
('00000000-0000-0000-0000-000000000203', 'Cash Flow Tracking', 'cash_flow_tracking', 'text', 'How cash flow is monitored', 'How do you monitor cash flow?', true, false, 4, 'Operations'),
('00000000-0000-0000-0000-000000000203', 'Budget Process', 'budget_process', 'text', 'Annual budget planning process', 'Do you create annual budgets? How?', false, false, 5, 'Operations'),
('00000000-0000-0000-0000-000000000203', 'Tax Reporting', 'tax_reporting', 'text', 'Tax obligations and reporting frequency', 'What are your tax reporting obligations?', true, false, 6, 'Compliance'),
('00000000-0000-0000-0000-000000000203', 'VAT Registration', 'vat_registered', 'boolean', 'Is the company VAT registered?', 'Are you VAT registered?', true, false, 7, 'Compliance'),
('00000000-0000-0000-0000-000000000203', 'Payroll System', 'payroll', 'text', 'How payroll is managed', 'How do you manage payroll?', true, false, 8, 'People'),
('00000000-0000-0000-0000-000000000203', 'Number of Employees', 'employee_count', 'number', 'Total employees', 'How many employees do you have?', true, false, 9, 'People'),
('00000000-0000-0000-0000-000000000203', 'Cost Centers', 'cost_centers', 'json', 'Cost center or department structure', 'Do you track costs by department or cost center?', false, false, 10, 'Operations'),
('00000000-0000-0000-0000-000000000203', 'Reporting Needs', 'reporting_needs', 'json', 'Key financial reports needed', 'What financial reports do you need regularly?', false, false, 11, 'Operations'),
('00000000-0000-0000-0000-000000000203', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 12, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Warehouse Operations
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000204', 'Warehouse Locations', 'locations', 'json', 'Physical warehouse locations', 'Where are your warehouse locations?', true, true, 0, 'Structure'),
('00000000-0000-0000-0000-000000000204', 'Naming Convention', 'naming_convention', 'text', 'How items are named/coded in stock', 'How do you name or code items in your stock system?', true, false, 1, 'Structure'),
('00000000-0000-0000-0000-000000000204', 'Stock Categories', 'stock_categories', 'json', 'Categories of stock: raw, WIP, finished', 'What categories of stock do you manage?', true, false, 2, 'Structure'),
('00000000-0000-0000-0000-000000000204', 'Current System', 'current_system', 'text', 'Current stock management tool', 'How do you currently track stock?', true, true, 3, 'Operations'),
('00000000-0000-0000-0000-000000000204', 'Reception Process', 'reception_process', 'text', 'How goods are received', 'Walk me through how you receive goods from suppliers.', true, false, 4, 'Operations'),
('00000000-0000-0000-0000-000000000204', 'Issue Process', 'issue_process', 'text', 'How materials are issued to production', 'How are materials issued from warehouse to production?', true, false, 5, 'Operations'),
('00000000-0000-0000-0000-000000000204', 'Min/Max Levels', 'min_max_levels', 'boolean', 'Are min/max stock levels defined?', 'Do you maintain minimum and maximum stock levels?', false, false, 6, 'Controls'),
('00000000-0000-0000-0000-000000000204', 'Inventory Frequency', 'inventory_frequency', 'select', 'How often physical inventory is done', 'How often do you do physical inventory counts?', false, false, 7, 'Controls'),
('00000000-0000-0000-0000-000000000204', 'Stock Transfers', 'stock_transfers', 'text', 'Inter-location transfers', 'Do you transfer stock between locations?', false, false, 8, 'Operations'),
('00000000-0000-0000-0000-000000000204', 'Waste Tracking', 'waste_tracking', 'text', 'How waste/scrap is tracked', 'How do you track waste or scrap material?', false, false, 9, 'Controls'),
('00000000-0000-0000-0000-000000000204', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 10, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Purchasing
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000201', 'Key Suppliers', 'key_suppliers', 'json', 'Main suppliers list', 'Who are your main suppliers?', true, true, 0, 'Suppliers'),
('00000000-0000-0000-0000-000000000201', 'Supplier Evaluation', 'supplier_evaluation', 'text', 'How suppliers are evaluated', 'How do you evaluate and select suppliers?', false, false, 1, 'Suppliers'),
('00000000-0000-0000-0000-000000000201', 'Order Process', 'order_process', 'text', 'How purchase orders are created', 'Walk me through how you create a purchase order.', true, true, 2, 'Process'),
('00000000-0000-0000-0000-000000000201', 'Order Frequency', 'order_frequency', 'text', 'How often orders are placed', 'How often do you place orders?', true, false, 3, 'Process'),
('00000000-0000-0000-0000-000000000201', 'Payment Terms', 'payment_terms', 'text', 'Standard supplier payment terms', 'What are your typical payment terms with suppliers?', true, false, 4, 'Financial'),
('00000000-0000-0000-0000-000000000201', 'Approval Workflow', 'approval_workflow', 'text', 'Who approves purchases and thresholds', 'Who approves purchases? Are there spending limits?', false, false, 5, 'Controls'),
('00000000-0000-0000-0000-000000000201', 'Quality Reception', 'quality_reception', 'text', 'How received goods are quality checked', 'How do you check quality when goods arrive?', false, false, 6, 'Quality'),
('00000000-0000-0000-0000-000000000201', 'Returns to Supplier', 'returns_process', 'text', 'How defective goods are returned', 'How do you handle returns to suppliers?', false, false, 7, 'Quality'),
('00000000-0000-0000-0000-000000000201', 'Current Tools', 'current_tools', 'text', 'Software used for purchasing', 'What tools do you use to manage purchasing?', true, false, 8, 'Tools'),
('00000000-0000-0000-0000-000000000201', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 9, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Logistics
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000202', 'Delivery Methods', 'delivery_methods', 'multi_select', 'How products are delivered', 'How do you deliver products to customers?', true, true, 0, 'Delivery'),
('00000000-0000-0000-0000-000000000202', 'Own Fleet', 'own_fleet', 'boolean', 'Do you have your own delivery vehicles?', 'Do you have your own delivery vehicles?', true, false, 1, 'Delivery'),
('00000000-0000-0000-0000-000000000202', 'External Carriers', 'external_carriers', 'json', 'Third-party delivery partners', 'Do you use external delivery companies?', false, false, 2, 'Delivery'),
('00000000-0000-0000-0000-000000000202', 'Delivery Planning', 'delivery_planning', 'text', 'How delivery schedule is planned', 'How do you plan delivery schedules?', true, true, 3, 'Planning'),
('00000000-0000-0000-0000-000000000202', 'Route Optimization', 'route_optimization', 'text', 'How routes are planned', 'How do you plan delivery routes?', false, false, 4, 'Planning'),
('00000000-0000-0000-0000-000000000202', 'Customer Notification', 'customer_notification', 'text', 'How customers are notified about delivery', 'How do you notify customers about delivery?', false, false, 5, 'Communication'),
('00000000-0000-0000-0000-000000000202', 'Installation Service', 'installation', 'boolean', 'Do you offer installation?', 'Do you offer installation or assembly service?', true, false, 6, 'Service'),
('00000000-0000-0000-0000-000000000202', 'Delivery Zones', 'delivery_zones', 'json', 'Geographic delivery coverage', 'What geographic area do you deliver to?', false, false, 7, 'Coverage'),
('00000000-0000-0000-0000-000000000202', 'Delivery Costs', 'delivery_costs', 'text', 'How delivery costs are calculated', 'How do you calculate delivery costs?', false, false, 8, 'Financial'),
('00000000-0000-0000-0000-000000000202', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 9, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Users & Roles
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000205', 'Departments', 'departments', 'json', 'Department structure', 'What departments exist in your organization?', true, true, 0, 'Structure'),
('00000000-0000-0000-0000-000000000205', 'Key Roles', 'key_roles', 'json', 'Important roles and responsibilities', 'What are the key roles and their responsibilities?', true, true, 1, 'Structure'),
('00000000-0000-0000-0000-000000000205', 'Decision Makers', 'decision_makers', 'json', 'Who makes what decisions', 'Who makes the key decisions?', true, false, 2, 'Authority'),
('00000000-0000-0000-0000-000000000205', 'Approval Chains', 'approval_chains', 'json', 'Approval workflows for common actions', 'What approval chains exist?', false, false, 3, 'Authority'),
('00000000-0000-0000-0000-000000000205', 'Access Needs', 'access_needs', 'json', 'What each role needs access to in ERP', 'What should each role have access to in the new system?', true, false, 4, 'ERP Design'),
('00000000-0000-0000-0000-000000000205', 'Training Needs', 'training_needs', 'text', 'Computer literacy and training requirements', 'What is the computer literacy level? Training needs?', false, false, 5, 'Adoption'),
('00000000-0000-0000-0000-000000000205', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 6, NULL);

-- ============================================================
-- SEED FIELDS — Track B: IT Infrastructure
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000206', 'Current Software', 'current_software', 'json', 'All software currently in use', 'What software does your company currently use?', true, true, 0, 'Software'),
('00000000-0000-0000-0000-000000000206', 'Hardware', 'hardware', 'json', 'Computers, printers, scanners, etc.', 'What hardware do you have? Computers, printers, scanners?', true, false, 1, 'Hardware'),
('00000000-0000-0000-0000-000000000206', 'Internet/Network', 'network', 'text', 'Internet connectivity and internal network', 'What is your internet and network setup?', true, false, 2, 'Infrastructure'),
('00000000-0000-0000-0000-000000000206', 'Integration Needs', 'integration_needs', 'json', 'Systems that need to connect with ERP', 'What systems should the new ERP integrate with?', true, true, 3, 'Integration'),
('00000000-0000-0000-0000-000000000206', 'IT Support', 'it_support', 'text', 'How IT issues are handled', 'Who handles IT support?', false, false, 4, 'Support'),
('00000000-0000-0000-0000-000000000206', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 5, NULL);

-- ============================================================
-- SEED FIELDS — Track B: Data Migration
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000207', 'Data Sources', 'data_sources', 'json', 'Where existing data lives', 'Where does your existing data live? Excel, old software?', true, true, 0, 'Sources'),
('00000000-0000-0000-0000-000000000207', 'Data Formats', 'data_formats', 'multi_select', 'Formats: Excel, CSV, database, paper', 'What format is the data in?', true, false, 1, 'Sources'),
('00000000-0000-0000-0000-000000000207', 'Data Volume', 'data_volume', 'text', 'Approximate amount of data', 'Approximately how much data are we talking about?', true, false, 2, 'Scale'),
('00000000-0000-0000-0000-000000000207', 'Priority Data', 'priority_data', 'json', 'What data must be migrated first', 'What data is most critical to migrate first?', true, true, 3, 'Planning'),
('00000000-0000-0000-0000-000000000207', 'Data Quality', 'data_quality', 'select', 'Overall quality: good, mixed, poor', 'How would you rate the quality of your existing data?', true, false, 4, 'Quality'),
('00000000-0000-0000-0000-000000000207', 'Cleanup Needed', 'cleanup_needed', 'text', 'Known data quality issues', 'Are there known data quality issues that need cleaning?', false, false, 5, 'Quality'),
('00000000-0000-0000-0000-000000000207', 'Historical Data', 'historical_data', 'text', 'How far back data needs to go', 'How far back do you need historical data?', false, false, 6, 'Planning'),
('00000000-0000-0000-0000-000000000207', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 7, NULL);

-- ============================================================
-- SEED FIELDS — Track A: Machines & Equipment
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000104', 'Machine Name', 'machine_name', 'text', 'Name/model of the machine', 'What is this machine called?', true, true, 0, 'Identity'),
('00000000-0000-0000-0000-000000000104', 'Machine Type', 'machine_type', 'select', 'Category: CNC, edgebander, saw, drill, press, etc.', 'What type of machine is this?', true, true, 1, 'Identity'),
('00000000-0000-0000-0000-000000000104', 'Manufacturer', 'manufacturer', 'text', 'Machine manufacturer', 'Who manufactured this machine?', false, false, 2, 'Identity'),
('00000000-0000-0000-0000-000000000104', 'Capabilities', 'capabilities', 'json', 'What operations this machine can perform', 'What operations can this machine perform?', true, false, 3, 'Specs'),
('00000000-0000-0000-0000-000000000104', 'Max Dimensions', 'max_dimensions', 'json', 'Maximum workpiece dimensions', 'What is the maximum size this machine can handle?', false, false, 4, 'Specs'),
('00000000-0000-0000-0000-000000000104', 'Speed/Capacity', 'capacity', 'text', 'Processing speed or daily capacity', 'What is the daily capacity of this machine?', false, false, 5, 'Specs'),
('00000000-0000-0000-0000-000000000104', 'Maintenance Schedule', 'maintenance', 'text', 'Maintenance frequency and requirements', 'How often does this machine need maintenance?', false, false, 6, 'Maintenance'),
('00000000-0000-0000-0000-000000000104', 'Operator Required', 'operator_skill', 'select', 'Skill level needed: basic, trained, specialist', 'What skill level does the operator need?', false, false, 7, 'People'),
('00000000-0000-0000-0000-000000000104', 'Software/CNC Programs', 'software', 'text', 'Associated software or programs', 'Does this machine use any software or CNC programs?', false, false, 8, 'Integration'),
('00000000-0000-0000-0000-000000000104', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 9, NULL);

-- ============================================================
-- SEED FIELDS — Track A: Quality Rules
-- ============================================================
INSERT INTO schema_fields (block_id, name, code, field_type, description, question_hint, is_required, is_bot_critical, display_order, group_label) VALUES
('00000000-0000-0000-0000-000000000105', 'Tolerance Standards', 'tolerance_standards', 'json', 'Dimensional tolerance rules', 'What dimensional tolerances do you work with?', true, true, 0, 'Standards'),
('00000000-0000-0000-0000-000000000105', 'Inspection Points', 'inspection_points', 'json', 'Where in production quality is checked', 'At what points in production do you inspect quality?', true, true, 1, 'Process'),
('00000000-0000-0000-0000-000000000105', 'Defect Categories', 'defect_categories', 'json', 'Types of defects tracked', 'What types of defects do you track?', true, false, 2, 'Tracking'),
('00000000-0000-0000-0000-000000000105', 'Rework Procedures', 'rework_procedures', 'text', 'How defective items are reworked', 'How do you handle defective items?', true, false, 3, 'Process'),
('00000000-0000-0000-0000-000000000105', 'Quality Records', 'quality_records', 'text', 'How quality data is recorded', 'How do you record quality data?', false, false, 4, 'Documentation'),
('00000000-0000-0000-0000-000000000105', 'Customer Standards', 'customer_standards', 'text', 'Standards required by customers', 'Do your customers have specific quality requirements?', false, false, 5, 'Standards'),
('00000000-0000-0000-0000-000000000105', 'Certifications', 'certifications', 'json', 'Quality certifications held', 'Do you hold any quality certifications?', false, false, 6, 'Standards'),
('00000000-0000-0000-0000-000000000105', 'Notes', 'notes', 'text', 'Additional notes', NULL, false, false, 7, NULL);

-- ============================================================================
-- DONE — Schema complete with 14 tables, RLS policies, indexes, and seed data
-- ============================================================================

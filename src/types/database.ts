// KEA Database Types — matches Supabase schema exactly

export type UserRole = 'admin' | 'consultant' | 'domain_expert' | 'manager' | 'viewer';
export type TrackAccess = 'track_a' | 'track_b' | 'dashboard';
export type ConversationStyle = 'open_ended' | 'guided';
export type TargetRole = 'domain_expert' | 'manager' | 'accountant' | 'logistics' | 'general';
export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'json' | 'file' | 'date';
export type SessionStatus = 'active' | 'completed' | 'paused';
export type MessageRole = 'user' | 'assistant' | 'system';
export type ExtractionStatus = 'in_progress' | 'pending_review' | 'confirmed' | 'needs_clarification';
export type ExtractionSource = 'bot_extraction' | 'user_correction' | 'consultant_edit';
export type AlertType = 'contradiction' | 'gap' | 'stale_data' | 'user_correction' | 'follow_up_needed';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';
export type QuestionPriority = 'low' | 'normal' | 'high' | 'urgent';
export type QuestionStatus = 'pending' | 'asked' | 'answered' | 'cancelled';
export type OrgStatus = 'active' | 'paused' | 'archived';
export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  language: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  subscription_tier: SubscriptionTier;
  active_template_id: string | null;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  full_name: string;
  role: UserRole;
  track_access: TrackAccess[];
  avatar_url: string | null;
  language: string;
  last_session_at: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  version: number;
  is_public: boolean;
  created_by: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  template_id: string;
  name: string;
  code: string;
  description: string | null;
  bot_personality: string;
  conversation_style: ConversationStyle;
  target_role: TargetRole;
  display_order: number;
  created_at: string;
}

export interface SchemaBlock {
  id: string;
  track_id: string;
  name: string;
  code: string;
  description: string | null;
  is_repeatable: boolean;
  display_order: number;
  icon: string | null;
  created_at: string;
}

export interface SchemaField {
  id: string;
  block_id: string;
  name: string;
  code: string;
  field_type: FieldType;
  description: string | null;
  question_hint: string | null;
  is_required: boolean;
  is_bot_critical: boolean;
  validation_rules: Record<string, unknown>;
  depends_on: Record<string, unknown> | null;
  default_value: string | null;
  display_order: number;
  group_label: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  organization_id: string;
  user_id: string;
  track_id: string;
  title: string | null;
  status: SessionStatus;
  summary: string | null;
  structured_summary: Record<string, unknown> | null;
  fields_covered: string[];
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  organization_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  extracted_fields: Record<string, unknown> | null;
  has_files: boolean;
  created_at: string;
}

export interface ExtractionInstance {
  id: string;
  organization_id: string;
  block_id: string;
  instance_label: string;
  data: Record<string, unknown>;
  completeness_pct: number;
  status: ExtractionStatus;
  confirmed_by: string | null;
  confirmed_at: string | null;
  source_messages: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractionHistory {
  id: string;
  instance_id: string;
  field_code: string;
  old_value: string | null;
  new_value: string | null;
  source: ExtractionSource;
  source_message_id: string | null;
  created_at: string;
}

export interface FileRecord {
  id: string;
  organization_id: string;
  message_id: string | null;
  instance_id: string | null;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  created_at: string;
}

export interface ProgressSnapshot {
  id: string;
  organization_id: string;
  track_id: string;
  block_id: string | null;
  completeness_pct: number;
  fields_total: number;
  fields_filled: number;
  fields_confirmed: number;
  snapshot_date: string;
  created_at: string;
}

export interface Alert {
  id: string;
  organization_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  related_instances: string[];
  related_messages: string[];
  status: AlertStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface InjectedQuestion {
  id: string;
  organization_id: string;
  track_id: string;
  target_user_id: string | null;
  question: string;
  context: string | null;
  priority: QuestionPriority;
  target_field_id: string | null;
  status: QuestionStatus;
  asked_in_message_id: string | null;
  created_by: string;
  created_at: string;
}

-- Migration: Moderation system, consent tracking, SPbGU disclaimer
-- P0-P1: review moderation, consent audit, complaint system

-- 1. Alter teacher_reviews: add moderation columns
alter table teacher_reviews
  add column if not exists moderation_reason text,
  add column if not exists moderated_by text,
  add column if not exists moderated_at timestamp,
  add column if not exists updated_at timestamp not null default now();

-- Update any null updated_at to created_at
update teacher_reviews set updated_at = created_at where updated_at is null;

-- 2. Create moderation_logs table
create table if not exists moderation_logs (
  id text primary key,
  review_id text not null references teacher_reviews(id) on delete cascade,
  admin_id text not null,
  action text not null check (action in ('approve', 'reject', 'request_edit', 'ban_user', 'dispute', 'restore')),
  reason text,
  created_at timestamp not null default now()
);

create index if not exists moderation_logs_review_idx on moderation_logs (review_id);
create index if not exists moderation_logs_admin_idx on moderation_logs (admin_id);
create index if not exists moderation_logs_created_idx on moderation_logs (created_at desc);

-- 3. Create user_consents table (152-FZ compliance)
create table if not exists user_consents (
  id text primary key,
  user_id text references "user"(id) on delete cascade,
  consent_type text not null check (consent_type in ('terms_of_service', 'personal_data', 'cookies_analytics', 'cookies_marketing')),
  document_version text not null default '1.0',
  accepted_at timestamp not null default now(),
  ip_hash text not null,
  user_agent_hash text not null
);

create index if not exists user_consents_user_idx on user_consents (user_id);
create index if not exists user_consents_type_user_idx on user_consents (user_id, consent_type);

-- 4. Create complaint_logs table
create table if not exists complaint_logs (
  id text primary key,
  review_id text not null references teacher_reviews(id) on delete cascade,
  complainant_name text,
  complainant_email text,
  reason text not null,
  details text,
  status text not null default 'new' check (status in ('new', 'resolved', 'dismissed')),
  admin_id text,
  admin_notes text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create index if not exists complaint_logs_review_idx on complaint_logs (review_id);
create index if not exists complaint_logs_status_idx on complaint_logs (status);

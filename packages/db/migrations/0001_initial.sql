-- ============================================================================
-- Truesman voicebot platform — initial schema
-- Migration 0001 (corrected)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type pos_type as enum ('manual', 'square', 'clover', 'toast');

create type project_status as enum ('draft', 'configuring', 'testing', 'live', 'paused', 'archived');

create type call_direction as enum ('inbound', 'outbound');

create type call_outcome as enum (
  'reservation_booked',
  'order_placed',
  'info_provided',
  'transferred',
  'voicemail',
  'no_answer',
  'abandoned',
  'error',
  'unknown'
);

create type order_type as enum ('pickup', 'delivery', 'dine_in');

create type order_status as enum (
  'pending',
  'acknowledged',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

create type reservation_status as enum ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');

create type member_role as enum ('owner', 'admin', 'viewer');

create type kitchen_delivery_method as enum ('pos_native', 'tablet', 'printer', 'sms', 'email', 'webhook');

-- ============================================================================
-- PROJECTS
-- ============================================================================

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  status project_status not null default 'draft',
  timezone text not null default 'America/Los_Angeles',

  business_name text not null,
  business_phone text,
  business_address text,

  pos_type pos_type not null default 'manual',
  pos_config jsonb not null default '{}'::jsonb,

  retell_agent_id text,
  twilio_phone_number text unique,

  daily_spend_cap_usd numeric(10, 2) default 50.00,
  alert_email text,
  alert_webhook_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index idx_projects_status on projects(status);
create index idx_projects_twilio_phone on projects(twilio_phone_number);

-- ============================================================================
-- PROJECT MEMBERS
-- ============================================================================

create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index idx_project_members_user on project_members(user_id);

-- ============================================================================
-- MANUAL ADAPTER DATA
-- ============================================================================

create table project_hours (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  unique (project_id, day_of_week)
);

create table project_reservation_rules (
  project_id uuid primary key references projects(id) on delete cascade,
  party_size_min int not null default 1,
  party_size_max int not null default 12,
  slot_duration_min int not null default 30,
  advance_days int not null default 30,
  max_concurrent_per_slot int not null default 4,
  buffer_before_close_min int not null default 60
);

-- ============================================================================
-- MENU
-- ============================================================================

create table menu_versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  version_number int not null,
  is_active boolean not null default false,
  published_at timestamptz,
  published_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);

create index idx_menu_versions_project_active on menu_versions(project_id, is_active) where is_active = true;

create table project_menu_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  menu_version_id uuid not null references menu_versions(id) on delete cascade,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  category text not null default 'Other',
  available boolean not null default true,
  tags text[] default array[]::text[],
  sort_order int not null default 0,
  pos_external_id text,
  created_at timestamptz not null default now()
);

create index idx_menu_items_version on project_menu_items(menu_version_id);
create index idx_menu_items_project on project_menu_items(project_id);

create table menu_item_availability_overrides (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  menu_item_id uuid not null references project_menu_items(id) on delete cascade,
  unavailable_from timestamptz not null default now(),
  unavailable_until timestamptz,
  reason text,
  set_by uuid references auth.users(id),
  set_at timestamptz not null default now()
);

create index idx_overrides_active on menu_item_availability_overrides(project_id, menu_item_id, unavailable_from, unavailable_until);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

create table project_customers (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  phone text not null,
  name text,
  email text,
  tags text[] default array[]::text[],
  pos_external_id text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (project_id, phone)
);

create index idx_customers_phone on project_customers(project_id, phone);

-- ============================================================================
-- CALLS
-- ============================================================================

create table calls (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,

  retell_call_id text unique,
  twilio_call_sid text unique,

  direction call_direction not null,
  caller_phone text,
  caller_name text,

  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_sec int,

  outcome call_outcome not null default 'unknown',
  outcome_summary text,

  retell_cost_usd numeric(10, 4) default 0,
  twilio_cost_usd numeric(10, 4) default 0,
  total_cost_usd numeric(10, 4) default 0,

  recording_url text,
  transcript_url text,
  transcript_text text,

  extracted_data jsonb default '{}'::jsonb,

  sentiment_score numeric(3, 2),
  quality_score numeric(3, 2),

  error_code text,
  error_message text,

  created_at timestamptz not null default now()
);

create index idx_calls_project_started on calls(project_id, started_at desc);
create index idx_calls_outcome on calls(project_id, outcome);

create table call_events (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid not null references calls(id) on delete cascade,
  ts timestamptz not null default now(),
  event_type text not null,
  payload jsonb default '{}'::jsonb
);

create index idx_call_events_call on call_events(call_id, ts);

-- ============================================================================
-- RESERVATIONS
-- ============================================================================

create table reservations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  call_id uuid references calls(id) on delete set null,
  customer_id uuid references project_customers(id) on delete set null,

  customer_name text not null,
  customer_phone text not null,
  party_size int not null check (party_size > 0),
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,

  status reservation_status not null default 'confirmed',
  source text not null default 'bot',
  pos_external_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reservations_project_time on reservations(project_id, start_time);
create index idx_reservations_status on reservations(project_id, status);

-- ============================================================================
-- ORDERS
-- ============================================================================

create table orders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  call_id uuid references calls(id) on delete set null,
  customer_id uuid references project_customers(id) on delete set null,

  customer_name text not null,
  customer_phone text not null,

  items jsonb not null default '[]'::jsonb,
  subtotal_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int not null default 0,

  order_type order_type not null,
  pickup_time timestamptz,
  delivery_address text,

  status order_status not null default 'pending',
  kitchen_ticket_printed_at timestamptz,
  kitchen_acknowledged_at timestamptz,

  pos_external_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_project_created on orders(project_id, created_at desc);
create index idx_orders_status on orders(project_id, status);

create table order_status_events (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  ts timestamptz not null default now(),
  source text,
  notes text
);

-- ============================================================================
-- KITCHEN DELIVERY CONFIG
-- ============================================================================

create table kitchen_delivery_config (
  project_id uuid primary key references projects(id) on delete cascade,
  delivery_method kitchen_delivery_method not null default 'pos_native',
  config jsonb not null default '{}'::jsonb,
  fallback_method kitchen_delivery_method,
  fallback_config jsonb default '{}'::jsonb,
  fallback_after_sec int default 60
);

-- ============================================================================
-- OBSERVABILITY
-- ============================================================================

create table error_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  call_id uuid references calls(id) on delete set null,
  severity text not null check (severity in ('debug', 'info', 'warn', 'error', 'fatal')),
  source text not null,
  message text not null,
  context jsonb default '{}'::jsonb,
  ts timestamptz not null default now()
);

create index idx_error_logs_project_ts on error_logs(project_id, ts desc);
create index idx_error_logs_severity on error_logs(severity, ts desc);

create table spend_tracking (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  date date not null,
  retell_cost_usd numeric(10, 4) not null default 0,
  twilio_cost_usd numeric(10, 4) not null default 0,
  total_cost_usd numeric(10, 4) not null default 0,
  call_count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (project_id, date)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table projects enable row level security;
alter table project_members enable row level security;
alter table project_hours enable row level security;
alter table project_reservation_rules enable row level security;
alter table menu_versions enable row level security;
alter table project_menu_items enable row level security;
alter table menu_item_availability_overrides enable row level security;
alter table project_customers enable row level security;
alter table calls enable row level security;
alter table call_events enable row level security;
alter table reservations enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table kitchen_delivery_config enable row level security;
alter table error_logs enable row level security;
alter table spend_tracking enable row level security;

-- Helper: does the current user belong to this project?
create or replace function auth_user_in_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Top-level read policies
create policy "members read projects"
  on projects for select
  using (auth_user_in_project(id));

create policy "members read project_members"
  on project_members for select
  using (auth_user_in_project(project_id));

-- Read policies for tables with a direct project_id column
do $$
declare
  t text;
  child_tables text[] := array[
    'project_hours',
    'project_reservation_rules',
    'menu_versions',
    'project_menu_items',
    'menu_item_availability_overrides',
    'project_customers',
    'calls',
    'reservations',
    'orders',
    'kitchen_delivery_config',
    'error_logs',
    'spend_tracking'
  ];
begin
  foreach t in array child_tables loop
    execute format(
      'create policy "members read %1$s" on %1$s for select using (auth_user_in_project(project_id));',
      t
    );
  end loop;
end$$;

-- Read policy for call_events (joins through calls to find the project)
create policy "members read call_events"
  on call_events for select
  using (
    exists (
      select 1 from calls
      where calls.id = call_events.call_id
        and auth_user_in_project(calls.project_id)
    )
  );

-- Read policy for order_status_events (joins through orders to find the project)
create policy "members read order_status_events"
  on order_status_events for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_status_events.order_id
        and auth_user_in_project(orders.project_id)
    )
  );

-- Note: write policies will be added in Week 2 when we build the project CRUD UI.
-- The backend uses the secret/service_role key which bypasses RLS entirely,
-- so the backend writes freely. RLS only applies to the dashboard client.
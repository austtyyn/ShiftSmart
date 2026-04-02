-- ============================================================
-- ShiftChat — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Locations (stores)
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  owner_id uuid references auth.users,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  phone text,
  avatar_emoji text default '👤',
  created_at timestamptz default now()
);

-- Memberships
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  location_id uuid references locations on delete cascade,
  role text check (role in ('owner', 'manager', 'crew')) default 'crew',
  joined_at timestamptz default now(),
  is_active boolean default true
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade,
  sender_id uuid references profiles on delete set null,
  content text not null,
  is_announcement boolean default false,
  created_at timestamptz default now()
);

-- Announcement Acknowledgements
create table if not exists acknowledgements (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages on delete cascade,
  user_id uuid references profiles on delete cascade,
  acknowledged_at timestamptz default now(),
  unique(message_id, user_id)
);

-- Invite Codes
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  location_id uuid references locations on delete cascade,
  created_by uuid references profiles on delete set null,
  role text check (role in ('owner', 'manager', 'crew')) default 'crew',
  expires_at timestamptz default now() + interval '48 hours',
  used_by uuid references profiles on delete set null,
  used_at timestamptz
);

-- Shifts
create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade,
  user_id uuid references profiles on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_by uuid references profiles on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table locations enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table messages enable row level security;
alter table acknowledgements enable row level security;
alter table invite_codes enable row level security;
alter table shifts enable row level security;

-- ============================================================
-- Profiles policies
-- ============================================================

-- Anyone authenticated can read profiles of people they share a location with
create policy "profiles: read own" on profiles
  for select using (auth.uid() = id);

create policy "profiles: read teammates" on profiles
  for select using (
    exists (
      select 1 from memberships m1
      join memberships m2 on m1.location_id = m2.location_id
      where m1.user_id = auth.uid()
        and m2.user_id = profiles.id
        and m1.is_active = true
    )
  );

create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- ============================================================
-- Locations policies
-- ============================================================

create policy "locations: read if member" on locations
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = locations.id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "locations: insert authenticated" on locations
  for insert with check (auth.uid() is not null);

create policy "locations: update for owner" on locations
  for update using (owner_id = auth.uid());

-- ============================================================
-- Memberships policies
-- ============================================================

create policy "memberships: read own location" on memberships
  for select using (
    exists (
      select 1 from memberships m2
      where m2.user_id = auth.uid()
        and m2.location_id = memberships.location_id
        and m2.is_active = true
    )
  );

create policy "memberships: insert via service" on memberships
  for insert with check (true);

create policy "memberships: update via managers" on memberships
  for update using (
    exists (
      select 1 from memberships m2
      where m2.user_id = auth.uid()
        and m2.location_id = memberships.location_id
        and m2.role in ('manager', 'owner')
        and m2.is_active = true
    )
  );

-- ============================================================
-- Messages policies
-- ============================================================

create policy "messages: read if active member" on messages
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = messages.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "messages: insert if active member" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from memberships
      where memberships.location_id = messages.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
    and (
      is_announcement = false
      or exists (
        select 1 from memberships
        where memberships.location_id = messages.location_id
          and memberships.user_id = auth.uid()
          and memberships.role in ('manager', 'owner')
          and memberships.is_active = true
      )
    )
  );

-- ============================================================
-- Acknowledgements policies
-- ============================================================

create policy "acks: read if member" on acknowledgements
  for select using (
    exists (
      select 1 from messages
      join memberships on memberships.location_id = messages.location_id
      where messages.id = acknowledgements.message_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "acks: insert own" on acknowledgements
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Invite codes policies
-- ============================================================

create policy "invite_codes: read if manager" on invite_codes
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = invite_codes.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
    or (
      -- Allow anyone to read by code value (for validation)
      true
    )
  );

create policy "invite_codes: insert if manager" on invite_codes
  for insert with check (
    exists (
      select 1 from memberships
      where memberships.location_id = invite_codes.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

create policy "invite_codes: update used_by" on invite_codes
  for update using (true);

-- ============================================================
-- Shifts policies
-- ============================================================

create policy "shifts: read if member" on shifts
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = shifts.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "shifts: insert if manager" on shifts
  for insert with check (
    exists (
      select 1 from memberships
      where memberships.location_id = shifts.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

create policy "shifts: delete if manager" on shifts
  for delete using (
    exists (
      select 1 from memberships
      where memberships.location_id = shifts.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

-- ============================================================
-- Reactions
-- ============================================================
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages on delete cascade,
  user_id uuid references profiles on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  unique(message_id, user_id, emoji)
);

-- ============================================================
-- Handoffs
-- ============================================================
create table if not exists handoffs (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade,
  message_id uuid references messages on delete set null,
  outgoing_user_id uuid references profiles on delete set null,
  incoming_user_id uuid references profiles on delete set null,
  shift_label text,
  notes jsonb not null default '[]',
  crew_tonight text[] default '{}',
  tasks_carried_over int default 0,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Tasks
-- ============================================================
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade,
  source_message_id uuid references messages on delete set null,
  title text not null,
  assigned_to uuid references profiles on delete set null,
  created_by uuid references profiles on delete set null,
  urgency text check (urgency in ('low', 'medium', 'high')) default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  completion_message_id uuid references messages on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- Swap Requests
-- ============================================================
create table if not exists swap_requests (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade,
  shift_id uuid references shifts on delete cascade,
  message_id uuid references messages on delete set null,
  requested_by uuid references profiles on delete set null,
  covered_by uuid references profiles on delete set null,
  approved_by uuid references profiles on delete set null,
  status text check (status in ('open', 'pending_approval', 'approved', 'cancelled')) default 'open',
  note text,
  escalated_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Availability
-- ============================================================
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  location_id uuid references locations on delete cascade,
  type text check (type in ('recurring', 'block_out', 'constraint')) not null,
  day_of_week int check (day_of_week between 0 and 6),
  start_time time,
  end_time time,
  start_date date,
  end_date date,
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- Extend existing tables
-- ============================================================

-- Messages: urgency level, message type, thread support, quick reply & metadata
alter table messages
  add column if not exists urgency text check (urgency in ('normal', 'heads_up', '911')) default 'normal',
  add column if not exists message_type text check (message_type in ('message', 'handoff', 'task', 'swap_request', 'quick_reply')) default 'message',
  add column if not exists thread_parent_id uuid references messages(id) on delete cascade,
  add column if not exists thread_reply_count int default 0,
  add column if not exists metadata jsonb;

-- Memberships: shift-based presence
alter table memberships
  add column if not exists presence text check (presence in ('on_shift', 'off_shift', 'starting_soon', 'unavailable')) default 'off_shift',
  add column if not exists presence_updated_at timestamptz default now();

-- ============================================================
-- RLS for new tables
-- ============================================================

alter table reactions enable row level security;
alter table handoffs enable row level security;
alter table tasks enable row level security;
alter table swap_requests enable row level security;
alter table availability enable row level security;

-- Reactions
create policy "reactions: read if member" on reactions
  for select using (
    exists (
      select 1 from messages
      join memberships on memberships.location_id = messages.location_id
      where messages.id = reactions.message_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "reactions: insert own" on reactions
  for insert with check (auth.uid() = user_id);

create policy "reactions: delete own" on reactions
  for delete using (auth.uid() = user_id);

-- Handoffs
create policy "handoffs: read if member" on handoffs
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = handoffs.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "handoffs: insert if manager or outgoing" on handoffs
  for insert with check (
    auth.uid() = outgoing_user_id
    or exists (
      select 1 from memberships
      where memberships.location_id = handoffs.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

create policy "handoffs: update if incoming or manager" on handoffs
  for update using (
    auth.uid() = incoming_user_id
    or exists (
      select 1 from memberships
      where memberships.location_id = handoffs.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

-- Tasks
create policy "tasks: read if member" on tasks
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = tasks.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "tasks: insert if member" on tasks
  for insert with check (
    exists (
      select 1 from memberships
      where memberships.location_id = tasks.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "tasks: update if assigned or manager" on tasks
  for update using (
    auth.uid() = assigned_to
    or auth.uid() = created_by
    or exists (
      select 1 from memberships
      where memberships.location_id = tasks.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

-- Swap Requests
create policy "swap_requests: read if member" on swap_requests
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = swap_requests.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "swap_requests: insert if member" on swap_requests
  for insert with check (
    auth.uid() = requested_by
    and exists (
      select 1 from memberships
      where memberships.location_id = swap_requests.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "swap_requests: update if involved or manager" on swap_requests
  for update using (
    auth.uid() = requested_by
    or auth.uid() = covered_by
    or exists (
      select 1 from memberships
      where memberships.location_id = swap_requests.location_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('manager', 'owner')
        and memberships.is_active = true
    )
  );

-- Availability
create policy "availability: read if member" on availability
  for select using (
    exists (
      select 1 from memberships
      where memberships.location_id = availability.location_id
        and memberships.user_id = auth.uid()
        and memberships.is_active = true
    )
  );

create policy "availability: insert own" on availability
  for insert with check (auth.uid() = user_id);

create policy "availability: update own" on availability
  for update using (auth.uid() = user_id);

create policy "availability: delete own" on availability
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Enable Realtime on messages table
-- ============================================================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table memberships;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table handoffs;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table swap_requests;

-- ============================================================
-- Profile auto-creation trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, avatar_emoji)
  values (new.id, new.phone, '👤')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

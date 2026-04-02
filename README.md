# ShiftChat

> Persistent team communication for shift-based workplaces. No more rebuilding group chats when someone leaves.

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** — auth (phone OTP), database (Postgres), realtime
- **Tailwind CSS v4** — dark theme, mobile-first
- **Zustand** — client state
- **Radix UI** — accessible components

## Quick Start

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. Enable **Phone Auth** in Authentication → Providers (requires Twilio or Supabase's built-in SMS)

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL, anon key, and service role key.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

### Authentication
- Phone number OTP (primary) — no passwords
- Magic link email (fallback)
- Invite code onboarding with emoji avatar picker

### Persistent Team Channel
- One permanent channel per store — never deleted, never reset
- Full history for all active members
- Removed members shown as "Former Team Member" — history preserved

### Member Management
- Add members via 6-digit invite codes (48hr expiry, single use)
- Remove members instantly with one click
- Promote crew → manager, demote manager → crew

### Announcements
- Managers post pinned announcements with amber styling
- Acknowledge button with live count for managers
- All announcements accessible even by new hires

### Schedule
- 7-day weekly grid with shift blocks
- "Who's Working Today" sidebar widget
- Add/delete shifts (managers only)

### Real-time Chat
- Supabase Realtime subscriptions
- Optimistic message sending with retry on failure
- Load older messages by scrolling up

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Owner / GM** | Full access — all settings, billing, add/remove managers |
| **Manager** | Add/remove crew, post announcements, manage schedule |
| **Crew** | Send messages, view schedule, acknowledge announcements |

---

## Project Structure

```
app/
├── (auth)/          # Login, OTP verify, onboarding
├── (app)/           # Protected app shell
│   ├── chat/        # Main persistent channel
│   ├── announcements/
│   ├── schedule/
│   ├── team/
│   └── settings/
├── join/[code]/     # Public invite link handler
└── api/             # API routes

components/
├── chat/            # MessageFeed, Bubbles, Input, WhoIsWorking
├── team/            # MemberTable, InviteModal, RemoveModal
├── schedule/        # WeekGrid, ShiftBlock, AddShiftForm
├── announcements/   # AnnouncementCard, AckProgress
└── ui/              # Button, Input, Badge, Modal

lib/supabase/        # Client + server Supabase clients, types
stores/              # Zustand stores (auth, chat, schedule)
hooks/               # Data fetching hooks with Supabase
```

---

## Deployment

Deploy to Vercel with one click. Set the environment variables in your Vercel project settings.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Database Schema

See `supabase-schema.sql` for the full schema including RLS policies.

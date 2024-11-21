-- Disable RLS on tables
alter table public.events disable row level security;
alter table public.event_attendees disable row level security;

-- Drop existing policies for events
drop policy if exists "Users can view all events" on public.events;
drop policy if exists "Authenticated users can create events" on public.events;
drop policy if exists "Users can update their own events" on public.events;
drop policy if exists "Users can delete their own events" on public.events;

-- Drop existing policies for event_attendees
drop policy if exists "Users can view event attendees" on public.event_attendees;
drop policy if exists "Authenticated users can manage attendance" on public.event_attendees;
drop policy if exists "Users can update their own attendance status" on public.event_attendees; 
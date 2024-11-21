-- Create events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text,
  recurring boolean default false,
  recurring_pattern jsonb, -- Stores frequency, interval, end_date etc.
  created_by uuid references auth.users(id) on delete cascade not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_attendees junction table
create table if not exists public.event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined', 'maybe')) not null,
  unique(event_id, member_id)
);

-- Add indexes for better query performance
create index if not exists events_date_idx on public.events(date);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists event_attendees_event_id_idx on public.event_attendees(event_id);
create index if not exists event_attendees_member_id_idx on public.event_attendees(member_id);

-- Add RLS (Row Level Security) policies
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;

-- Events policies
create policy "Users can view all events"
  on public.events for select
  using (true);

create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = created_by);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = created_by);

-- Event attendees policies
create policy "Users can view event attendees"
  on public.event_attendees for select
  using (true);

create policy "Authenticated users can manage their attendance"
  on public.event_attendees for insert
  with check (
    auth.role() = 'authenticated' AND
    member_id = (
      select id from public.members 
      where auth_id = auth.uid()
      limit 1
    )
  );

create policy "Users can update their own attendance status"
  on public.event_attendees for update
  using (
    member_id = (
      select id from public.members 
      where auth_id = auth.uid()
      limit 1
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.events
  for each row
  execute function public.handle_updated_at();

-- Add some example events (optional)
insert into public.events (title, description, date, time, location, created_by)
values 
  ('Monthly Prayer Meeting', 'Join us for our monthly prayer gathering', '2024-02-01', '19:00', 'Main Hall', auth.uid()),
  ('Youth Group', 'Weekly youth group meeting', '2024-02-03', '18:30', 'Youth Room', auth.uid()),
  ('Sunday Service', 'Regular Sunday worship service', '2024-02-04', '10:00', 'Main Sanctuary', auth.uid()); 
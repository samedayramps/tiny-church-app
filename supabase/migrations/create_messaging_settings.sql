create table messaging_settings (
  id uuid primary key default uuid_generate_v4(),
  sender_name text not null,
  sender_email text not null,
  default_template text,
  reply_to text,
  email_footer text,
  scheduling_enabled boolean default false,
  default_schedule_time text,
  retry_attempts integer default 3,
  batch_size integer default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table messaging_settings enable row level security;

create policy "Allow authenticated users to read messaging settings"
  on messaging_settings for select
  to authenticated
  using (true);

create policy "Allow authenticated users to update messaging settings"
  on messaging_settings for update
  to authenticated
  using (true);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on messaging_settings
  for each row
  execute function public.set_updated_at(); 
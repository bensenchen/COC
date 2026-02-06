create table documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  content text,
  tenant_id text not null
);

-- Add RLS policies as needed
alter table documents enable row level security;

create policy "Enable all access for now" on documents
  for all using (true);

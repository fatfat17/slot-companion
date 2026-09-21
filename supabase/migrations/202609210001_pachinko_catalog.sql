create table if not exists public.pachinko_catalog_records (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pachinko_catalog_records enable row level security;

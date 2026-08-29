create table if not exists public.machine_catalog_records (
  id text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_import_jobs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  range_start text,
  range_end text,
  status text not null check (status in ('preview','approved','partial','failed')),
  received_count integer not null default 0,
  processed_count integer not null default 0,
  imported_count integer not null default 0,
  merged_count integer not null default 0,
  skipped_count integer not null default 0,
  error jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.machine_catalog_records enable row level security;
alter table public.catalog_import_jobs enable row level security;

-- Catalog access remains server-only. The service role is read exclusively by
-- Next.js route handlers and must never be exposed through NEXT_PUBLIC_*.

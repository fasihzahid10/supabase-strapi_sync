create extension if not exists "uuid-ossp";

create table if not exists public.entries (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  timestamp timestamptz default now()
);

-- Run once in Supabase > SQL Editor. Safe to re-run for policies and publication.
-- Room identifiers are room-01 ... room-64.
create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null check (room_id ~ '^room-(0[1-9]|[1-5][0-9]|6[0-4])$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists room_messages_room_created_idx on public.room_messages (room_id, created_at desc);
alter table public.room_messages enable row level security;
drop policy if exists "Authenticated can read room messages" on public.room_messages;
create policy "Authenticated can read room messages" on public.room_messages for select to authenticated using (true);
drop policy if exists "Authenticated can send own messages" on public.room_messages;
create policy "Authenticated can send own messages" on public.room_messages for insert to authenticated with check (auth.uid() = user_id);
-- No update or delete permission from browsers.
-- Do not add service_role key to the frontend!
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='room_messages') then
    alter publication supabase_realtime add table public.room_messages;
  end if;
end $$;

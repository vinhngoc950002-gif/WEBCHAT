-- Run after 001_chat_schema.sql in Supabase SQL Editor.
create table if not exists public.friendships (
 id uuid primary key default gen_random_uuid(),
 requester_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 requester_name text not null check (char_length(requester_name) between 1 and 24),
 recipient_name text not null check (char_length(recipient_name) between 1 and 24),
 status text not null default 'pending' check (status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 check (requester_id <> recipient_id)
);
create unique index if not exists friendships_pair_idx on public.friendships (least(requester_id,recipient_id),greatest(requester_id,recipient_id));
create index if not exists friendships_recipient_idx on public.friendships(recipient_id);
alter table public.friendships enable row level security;
drop policy if exists friendship_read on public.friendships;
create policy friendship_read on public.friendships for select to authenticated using (auth.uid() in (requester_id,recipient_id));
drop policy if exists friendship_request on public.friendships;
create policy friendship_request on public.friendships for insert to authenticated with check (auth.uid()=requester_id and status='pending');
drop policy if exists friendship_decline on public.friendships;
create policy friendship_decline on public.friendships for delete to authenticated using (auth.uid() in (requester_id,recipient_id) and status='pending');
-- No client UPDATE: this function changes only status, and only for the recipient.
create or replace function public.accept_friendship(friendship_id uuid)
returns setof public.friendships language sql security definer set search_path = '' as $$
 update public.friendships set status='accepted'
 where id=friendship_id and recipient_id=auth.uid() and status='pending'
 returning *;
$$;
revoke all on function public.accept_friendship(uuid) from public, anon;
grant execute on function public.accept_friendship(uuid) to authenticated;

create table if not exists public.private_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 content text not null check (char_length(content) between 1 and 1000),
 created_at timestamptz not null default now(),
 check (sender_id <> recipient_id)
);
create index if not exists private_messages_pair_idx on public.private_messages(sender_id,recipient_id,created_at desc);
create index if not exists private_messages_recipient_idx on public.private_messages(recipient_id,created_at desc);
alter table public.private_messages enable row level security;
drop policy if exists private_read on public.private_messages;
create policy private_read on public.private_messages for select to authenticated using (auth.uid() in (sender_id,recipient_id));
drop policy if exists private_send on public.private_messages;
create policy private_send on public.private_messages for insert to authenticated with check (
 auth.uid()=sender_id and exists (
  select 1 from public.friendships f where f.status='accepted' and
  ((f.requester_id=sender_id and f.recipient_id=private_messages.recipient_id) or
   (f.recipient_id=sender_id and f.requester_id=private_messages.recipient_id))
 )
);
grant select,insert,delete on public.friendships to authenticated;
grant select,insert on public.private_messages to authenticated;
revoke update on public.friendships from authenticated;
revoke update,delete on public.private_messages from authenticated;
do $$ begin
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='friendships') then
  alter publication supabase_realtime add table public.friendships;
 end if;
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='private_messages') then
  alter publication supabase_realtime add table public.private_messages;
 end if;
end $$;

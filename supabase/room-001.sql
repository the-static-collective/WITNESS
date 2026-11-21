-- WITNESS ROOM-001
-- Canonical reproducible database/storage contract for the live WITNESS Supabase project.
-- Applied initially through the connected Supabase tooling on 2026-09-26.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.witness_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  work text not null default 'Bible',
  passage_id text not null default 'matthew.5',
  edition_id text not null default 'engwebp',
  assignment_strategy text not null default 'alternating-verses',
  invite_token uuid not null default gen_random_uuid() unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  is_open boolean not null default true
);

create table if not exists public.witness_room_members (
  room_id uuid not null references public.witness_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  reader_slot text not null check (reader_slot in ('A','B','listener')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create unique index if not exists witness_one_primary_reader_per_slot
on public.witness_room_members(room_id, reader_slot)
where reader_slot in ('A','B');

create table if not exists public.witness_recordings (
  id uuid primary key default gen_random_uuid(),
  recording_id text not null unique check (char_length(recording_id) between 8 and 200),
  room_id uuid not null references public.witness_rooms(id) on delete restrict,
  passage_start text not null,
  verse integer not null check (verse > 0),
  text_edition_id text not null,
  reader_user_id uuid not null references auth.users(id) on delete restrict,
  reader_slot text not null check (reader_slot in ('A','B','listener')),
  reader_name text not null check (char_length(reader_name) between 1 and 80),
  storage_path text not null unique,
  media_type text not null check (media_type like 'audio/%'),
  sha256 text not null check (sha256 ~ '^[a-fA-F0-9]{64}$'),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  recorded_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  supersedes uuid references public.witness_recordings(id) on delete restrict,
  provenance_note text,
  identity_mode text not null default 'pseudonymous'
    check (identity_mode in ('public','pseudonymous','anonymous','undisclosed')),
  recording_license text not null default 'contributor-permission-room-001',
  relations jsonb not null default '[]'::jsonb
);

create index if not exists witness_recordings_room_verse_idx
  on public.witness_recordings(room_id, verse, recorded_at desc);
create index if not exists witness_rooms_created_by_idx
  on public.witness_rooms(created_by);
create index if not exists witness_room_members_user_id_idx
  on public.witness_room_members(user_id);
create index if not exists witness_recordings_reader_user_idx
  on public.witness_recordings(reader_user_id);
create index if not exists witness_recordings_supersedes_idx
  on public.witness_recordings(supersedes);

create or replace function private.is_witness_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.witness_room_members m
    where m.room_id = p_room_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function private.can_join_witness_room(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.witness_rooms r
    where r.id = p_room_id
      and r.is_open = true
  );
$$;

create or replace function private.can_access_witness_storage_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.witness_room_members m
    where m.room_id::text = split_part(p_name, '/', 1)
      and m.user_id = auth.uid()
  );
$$;

create or replace function private.owns_witness_storage_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.witness_room_members m
    where m.room_id::text = split_part(p_name, '/', 1)
      and m.user_id = auth.uid()
      and m.user_id::text = split_part(p_name, '/', 2)
  );
$$;

revoke all on function private.is_witness_room_member(uuid) from public;
revoke all on function private.can_join_witness_room(uuid) from public;
revoke all on function private.can_access_witness_storage_path(text) from public;
revoke all on function private.owns_witness_storage_path(text) from public;

grant execute on function private.is_witness_room_member(uuid) to authenticated;
grant execute on function private.can_join_witness_room(uuid) to authenticated;
grant execute on function private.can_access_witness_storage_path(text) to authenticated;
grant execute on function private.owns_witness_storage_path(text) to authenticated;

drop function if exists public.create_witness_room(text,text,text,text,text);
drop function if exists public.join_witness_room(uuid,text,text);

alter table public.witness_rooms enable row level security;
alter table public.witness_room_members enable row level security;
alter table public.witness_recordings enable row level security;

drop policy if exists witness_rooms_member_select on public.witness_rooms;
create policy witness_rooms_member_select
on public.witness_rooms
for select
to authenticated
using (
  created_by = (select auth.uid())
  or private.is_witness_room_member(id)
);

drop policy if exists witness_rooms_creator_insert on public.witness_rooms;
create policy witness_rooms_creator_insert
on public.witness_rooms
for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists witness_members_room_select on public.witness_room_members;
create policy witness_members_room_select
on public.witness_room_members
for select
to authenticated
using (private.is_witness_room_member(room_id));

drop policy if exists witness_members_self_join on public.witness_room_members;
create policy witness_members_self_join
on public.witness_room_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    exists (
      select 1
      from public.witness_rooms r
      where r.id = witness_room_members.room_id
        and r.created_by = (select auth.uid())
    )
    or private.can_join_witness_room(room_id)
  )
);

drop policy if exists witness_recordings_room_select on public.witness_recordings;
create policy witness_recordings_room_select
on public.witness_recordings
for select
to authenticated
using (private.is_witness_room_member(room_id));

drop policy if exists witness_recordings_member_insert on public.witness_recordings;
create policy witness_recordings_member_insert
on public.witness_recordings
for insert
to authenticated
with check (
  reader_user_id = (select auth.uid())
  and exists (
    select 1
    from public.witness_room_members m
    where m.room_id = witness_recordings.room_id
      and m.user_id = (select auth.uid())
      and m.reader_slot = witness_recordings.reader_slot
      and m.display_name = witness_recordings.reader_name
  )
);

revoke all on public.witness_rooms from anon, authenticated;
revoke all on public.witness_room_members from anon, authenticated;
revoke all on public.witness_recordings from anon, authenticated;

grant select, insert on public.witness_rooms to authenticated;
grant select, insert on public.witness_room_members to authenticated;
grant select, insert on public.witness_recordings to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'witness-audio',
  'witness-audio',
  false,
  15728640,
  array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/x-m4a']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists witness_audio_room_read on storage.objects;
create policy witness_audio_room_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'witness-audio'
  and private.can_access_witness_storage_path(name)
);

drop policy if exists witness_audio_own_insert on storage.objects;
create policy witness_audio_own_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'witness-audio'
  and private.owns_witness_storage_path(name)
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='witness_recordings'
  ) then
    alter publication supabase_realtime add table public.witness_recordings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='witness_room_members'
  ) then
    alter publication supabase_realtime add table public.witness_room_members;
  end if;
end $$;

-- API keys table
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_user_id_idx on public.api_keys (user_id);
create index if not exists api_keys_key_idx on public.api_keys (key);

alter table public.api_keys enable row level security;

create policy "Users can select own api keys"
on public.api_keys
for select
using (auth.uid() = user_id);

create policy "Users can insert own api keys"
on public.api_keys
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own api keys"
on public.api_keys
for delete
using (auth.uid() = user_id);

-- Server-side API key validation (used by /api/execute)
create or replace function public.get_user_id_by_api_key(api_key text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select user_id
  from public.api_keys
  where key = api_key
  limit 1;
$$;

grant execute on function public.get_user_id_by_api_key(text) to anon, authenticated;

-- Policy check for API key requests (no user JWT available)
create or replace function public.is_tool_blocked_for_user(
  p_user_id uuid,
  p_tool_name text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.policies
    where user_id = p_user_id
      and tool_name = p_tool_name
      and action = 'block'
  );
$$;

grant execute on function public.is_tool_blocked_for_user(uuid, text) to anon, authenticated;

-- Audit log insert for API key requests
create or replace function public.insert_audit_log_for_user(
  p_user_id uuid,
  p_tool_name text,
  p_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (user_id, tool_name, status, reason)
  values (p_user_id, p_tool_name, p_status, p_reason);
end;
$$;

grant execute on function public.insert_audit_log_for_user(uuid, text, text, text) to anon, authenticated;
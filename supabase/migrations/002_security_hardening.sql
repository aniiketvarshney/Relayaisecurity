create extension if not exists pgcrypto;

alter table public.api_keys
  add column if not exists key_hash text,
  add column if not exists key_preview text;

alter table public.api_keys
  alter column key drop not null;

create unique index if not exists api_keys_key_hash_idx
  on public.api_keys (key_hash)
  where key_hash is not null;

update public.api_keys
set
  key_hash = encode(extensions.digest(convert_to(key, 'UTF8'), 'sha256'::text), 'hex'),
  key_preview = 'relay_sk_****' || right(key, 4)
where key is not null
  and key_hash is null;

create or replace function public.get_user_id_by_api_key(api_key text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select user_id
  from public.api_keys
  where key_hash = encode(extensions.digest(convert_to(api_key, 'UTF8'), 'sha256'::text), 'hex')
     or key = api_key
  limit 1;
$$;

grant execute on function public.get_user_id_by_api_key(text) to anon, authenticated;

create or replace function public.is_any_tool_blocked_for_user(
  p_user_id uuid,
  p_tool_names text[]
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
    where user_id::text = p_user_id::text
      and tool_name = any(p_tool_names)
      and action = 'block'
  );
$$;

grant execute on function public.is_any_tool_blocked_for_user(uuid, text[]) to anon, authenticated;

create or replace function public.count_audit_logs_for_user_since(
  p_user_id uuid,
  p_since timestamptz
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.audit_logs
  where user_id::text = p_user_id::text
    and created_at >= p_since;
$$;

grant execute on function public.count_audit_logs_for_user_since(uuid, timestamptz) to anon, authenticated;

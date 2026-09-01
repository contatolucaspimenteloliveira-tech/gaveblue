create extension if not exists pgcrypto;

create table if not exists public.wetasks_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  title text not null,
  description text not null default '',
  due_date date not null,
  due_time time,
  timezone text not null default 'America/Sao_Paulo',
  scheduled_at timestamptz,
  priority text not null default 'low' check (priority in ('low', 'medium', 'high', 'urgent')),
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'done')),
  notification_sent_at timestamptz,
  notification_claimed_at timestamptz,
  notification_attempts integer not null default 0,
  last_notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create table if not exists public.wetasks_notifications (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text,
  type text not null default 'info',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.wetasks_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wetasks_tasks_due_idx
  on public.wetasks_tasks (scheduled_at)
  where status = 'pending' and notification_sent_at is null;
create index if not exists wetasks_push_user_idx
  on public.wetasks_push_subscriptions (user_id)
  where active;

create or replace function public.wetasks_prepare_task()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  next_schedule timestamptz;
begin
  new.updated_at := now();
  next_schedule := case
    when new.due_time is null then null
    else ((new.due_date::text || ' ' || new.due_time::text)::timestamp at time zone new.timezone)
  end;

  if tg_op = 'INSERT'
     or new.due_date is distinct from old.due_date
     or new.due_time is distinct from old.due_time
     or new.timezone is distinct from old.timezone
     or new.status is distinct from old.status then
    new.notification_sent_at := null;
    new.notification_claimed_at := null;
    new.notification_attempts := 0;
    new.last_notification_error := null;
  end if;

  new.scheduled_at := next_schedule;
  return new;
end;
$$;

drop trigger if exists wetasks_tasks_prepare on public.wetasks_tasks;
create trigger wetasks_tasks_prepare
before insert or update on public.wetasks_tasks
for each row execute function public.wetasks_prepare_task();

create or replace function public.wetasks_touch_subscription()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists wetasks_push_touch on public.wetasks_push_subscriptions;
create trigger wetasks_push_touch
before update on public.wetasks_push_subscriptions
for each row execute function public.wetasks_touch_subscription();

alter table public.wetasks_tasks enable row level security;
alter table public.wetasks_notifications enable row level security;
alter table public.wetasks_push_subscriptions enable row level security;

drop policy if exists "wetasks own tasks" on public.wetasks_tasks;
create policy "wetasks own tasks" on public.wetasks_tasks
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wetasks own notifications" on public.wetasks_notifications;
create policy "wetasks own notifications" on public.wetasks_notifications
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wetasks own subscriptions" on public.wetasks_push_subscriptions;
create policy "wetasks own subscriptions" on public.wetasks_push_subscriptions
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.wetasks_tasks to authenticated;
grant select, insert, update, delete on public.wetasks_notifications to authenticated;
grant select, insert, update, delete on public.wetasks_push_subscriptions to authenticated;

create or replace function public.claim_due_wetasks_tasks(batch_size integer default 100)
returns setof public.wetasks_tasks
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role required';
  end if;

  return query
  with due as (
    select t.user_id, t.task_id
    from public.wetasks_tasks t
    where t.status = 'pending'
      and t.scheduled_at is not null
      and t.scheduled_at <= now()
      and t.scheduled_at >= now() - interval '24 hours'
      and t.notification_sent_at is null
      and (t.notification_claimed_at is null or t.notification_claimed_at < now() - interval '5 minutes')
    order by t.scheduled_at
    limit greatest(1, least(coalesce(batch_size, 100), 500))
    for update skip locked
  ), claimed as (
    update public.wetasks_tasks t
    set notification_claimed_at = now(),
        notification_attempts = t.notification_attempts + 1
    from due
    where t.user_id = due.user_id and t.task_id = due.task_id
    returning t.*
  )
  select * from claimed;
end;
$$;

revoke all on function public.claim_due_wetasks_tasks(integer) from public, anon, authenticated;
grant execute on function public.claim_due_wetasks_tasks(integer) to service_role;

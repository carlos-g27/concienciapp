-- Victorias diarias (Daily Wins) — tablas + RLS.
--
-- Ejecutar UNA vez en Supabase (SQL Editor). Crea las dos tablas de la
-- funcionalidad "Victorias diarias" del dashboard y activa RLS para que cada
-- usuario solo pueda ver y modificar sus propias filas.
--
--   daily_wins      : catálogo personal de mini-metas del usuario.
--   daily_win_logs  : registro de cumplimiento por día (marcar = insertar fila;
--                     desmarcar = borrar la fila del día). unique(win_id, date)
--                     hace idempotente el marcado y evita duplicados.

-- === Tablas ===

create table if not exists public.daily_wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  created_at timestamptz default now()
);

create table if not exists public.daily_win_logs (
  id uuid primary key default gen_random_uuid(),
  win_id uuid not null references public.daily_wins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz default now(),
  unique (win_id, date)
);

-- Índices para las consultas del dashboard (victorias del usuario / logs de hoy).
create index if not exists daily_wins_user_id_idx on public.daily_wins (user_id);
create index if not exists daily_win_logs_user_date_idx on public.daily_win_logs (user_id, date);

-- === RLS ===

alter table public.daily_wins enable row level security;
alter table public.daily_win_logs enable row level security;

-- daily_wins: el dueño (auth.uid() = user_id) puede todo sobre sus filas.
create policy "daily_wins_select_own" on public.daily_wins
  for select using (auth.uid() = user_id);
create policy "daily_wins_insert_own" on public.daily_wins
  for insert with check (auth.uid() = user_id);
create policy "daily_wins_update_own" on public.daily_wins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_wins_delete_own" on public.daily_wins
  for delete using (auth.uid() = user_id);

-- daily_win_logs: el dueño (auth.uid() = user_id) puede todo sobre sus filas.
create policy "daily_win_logs_select_own" on public.daily_win_logs
  for select using (auth.uid() = user_id);
create policy "daily_win_logs_insert_own" on public.daily_win_logs
  for insert with check (auth.uid() = user_id);
create policy "daily_win_logs_update_own" on public.daily_win_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_win_logs_delete_own" on public.daily_win_logs
  for delete using (auth.uid() = user_id);

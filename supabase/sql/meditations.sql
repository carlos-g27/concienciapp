-- Catálogo de meditaciones — duración en minutos + función is_admin() + RLS.
--
-- Ejecutar UNA vez en Supabase (SQL Editor). Es idempotente: se puede volver
-- a correr sin romper nada.
--
--   is_admin()   : true si el usuario autenticado tiene profiles.role = 'admin'.
--                  security definer para que las políticas puedan leer
--                  `profiles` sin depender de las políticas RLS de esa tabla.
--   meditations  : `duration` pasa de text ("10 min") a integer (minutos).
--                  Lectura para cualquier usuario autenticado; escritura solo admin.

-- === Función is_admin() ===

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- === duration: text → integer (minutos) ===
-- Conserva solo los dígitos del valor anterior ("10 min" → 10); vacío → null.

do $$
begin
  if (
    select data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'meditations' and column_name = 'duration'
  ) = 'text' then
    alter table public.meditations
      alter column duration type integer
      using nullif(regexp_replace(duration, '\D', '', 'g'), '')::integer;
  end if;
end $$;

-- === RLS ===

alter table public.meditations enable row level security;

drop policy if exists "meditations_select_authenticated" on public.meditations;
create policy "meditations_select_authenticated" on public.meditations
  for select to authenticated using (true);

drop policy if exists "meditations_insert_admin" on public.meditations;
create policy "meditations_insert_admin" on public.meditations
  for insert to authenticated with check (public.is_admin());

drop policy if exists "meditations_update_admin" on public.meditations;
create policy "meditations_update_admin" on public.meditations
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "meditations_delete_admin" on public.meditations;
create policy "meditations_delete_admin" on public.meditations
  for delete to authenticated using (public.is_admin());

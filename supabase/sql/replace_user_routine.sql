-- Reemplaza de forma ATÓMICA la rutina de un usuario (Fase 6E).
--
-- Ejecutar UNA vez en Supabase (SQL Editor). La función corre en una
-- transacción implícita: si algo falla, no se aplica nada (evita dejar al
-- usuario sin rutina). `security invoker` (por defecto) → respeta RLS y corre
-- con la sesión del admin que la invoca desde la Server Action.
--
-- Parámetros:
--   p_user_id : uuid del usuario
--   p_routine : jsonb array de { exercise_id, day, sets, reps }, en el orden
--               en que el admin los dejó (arrastrar y soltar)
--   p_focus   : jsonb array de { day, focus }

-- Orden de los ejercicios: la app ordena por esta columna dentro de cada día.
-- Las filas que ya existían quedan en 0 hasta que el admin vuelva a guardar.
alter table public.user_routines
  add column if not exists position int not null default 0;

create or replace function public.replace_user_routine(
  p_user_id uuid,
  p_routine jsonb,
  p_focus jsonb
) returns void
language plpgsql
as $$
begin
  -- Reemplazo completo de la rutina
  delete from public.user_routines where user_id = p_user_id;

  -- `with ordinality` numera los elementos en el orden del array → position
  insert into public.user_routines (user_id, exercise_id, day, sets, reps, position)
  select
    p_user_id,
    (r.value->>'exercise_id')::uuid,
    r.value->>'day',
    (r.value->>'sets')::int,
    (r.value->>'reps')::int,
    (r.ord - 1)::int
  from jsonb_array_elements(p_routine) with ordinality as r(value, ord);

  -- Enfoque por día (upsert)
  insert into public.user_routine_focus (user_id, day, focus)
  select p_user_id, f->>'day', f->>'focus'
  from jsonb_array_elements(p_focus) as f
  on conflict (user_id, day) do update set focus = excluded.focus;
end;
$$;

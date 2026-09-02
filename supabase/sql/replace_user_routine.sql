-- Reemplaza de forma ATÓMICA la rutina de un usuario (Fase 6E).
--
-- Ejecutar UNA vez en Supabase (SQL Editor). La función corre en una
-- transacción implícita: si algo falla, no se aplica nada (evita dejar al
-- usuario sin rutina). `security invoker` (por defecto) → respeta RLS y corre
-- con la sesión del admin que la invoca desde la Server Action.
--
-- Parámetros:
--   p_user_id : uuid del usuario
--   p_routine : jsonb array de { exercise_id, day, sets, reps }
--   p_focus   : jsonb array de { day, focus }

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

  insert into public.user_routines (user_id, exercise_id, day, sets, reps)
  select
    p_user_id,
    (r->>'exercise_id')::uuid,
    r->>'day',
    (r->>'sets')::int,
    (r->>'reps')::int
  from jsonb_array_elements(p_routine) as r;

  -- Enfoque por día (upsert)
  insert into public.user_routine_focus (user_id, day, focus)
  select p_user_id, f->>'day', f->>'focus'
  from jsonb_array_elements(p_focus) as f
  on conflict (user_id, day) do update set focus = excluded.focus;
end;
$$;

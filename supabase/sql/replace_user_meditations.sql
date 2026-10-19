-- Reemplaza de forma ATÓMICA las meditaciones asignadas a un usuario.
--
-- Ejecutar UNA vez en Supabase (SQL Editor). La función corre en una
-- transacción implícita: si el insert falla tras el delete, no se aplica nada
-- (evita dejar al usuario sin meditaciones). `security invoker` (por defecto) →
-- respeta RLS y corre con la sesión del admin que la invoca desde la Server Action.
--
-- Parámetros:
--   p_user_id     : uuid del usuario
--   p_meditations : jsonb array de { meditation_id }

create or replace function public.replace_user_meditations(
  p_user_id uuid,
  p_meditations jsonb
) returns void
language plpgsql
as $$
begin
  delete from public.user_meditations where user_id = p_user_id;

  insert into public.user_meditations (user_id, meditation_id)
  select p_user_id, (m->>'meditation_id')::uuid
  from jsonb_array_elements(p_meditations) as m;
end;
$$;

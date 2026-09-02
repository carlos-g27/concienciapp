-- Reemplaza de forma ATÓMICA el plan de comidas de un usuario (Fase 6F).
--
-- Ejecutar UNA vez en Supabase (SQL Editor). La función corre en una
-- transacción implícita: si el insert falla tras el delete, no se aplica nada
-- (evita dejar al usuario sin plan). `security invoker` (por defecto) → respeta
-- RLS y corre con la sesión del admin que la invoca desde la Server Action.
--
-- Parámetros:
--   p_user_id : uuid del usuario
--   p_meals   : jsonb array de { recipe_id }

create or replace function public.replace_user_meals(
  p_user_id uuid,
  p_meals jsonb
) returns void
language plpgsql
as $$
begin
  delete from public.user_meals where user_id = p_user_id;

  insert into public.user_meals (user_id, recipe_id)
  select p_user_id, (m->>'recipe_id')::uuid
  from jsonb_array_elements(p_meals) as m;
end;
$$;

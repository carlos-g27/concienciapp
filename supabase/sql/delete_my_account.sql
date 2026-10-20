-- Eliminar la propia cuenta (usuario o admin) de forma COMPLETA y ATÓMICA.
--
-- Ejecutar UNA vez en Supabase (SQL Editor). Se puede volver a correr.
--
--   can_delete_my_account() : 'ok' | 'last_admin' | 'no_session'. La Server
--                             Action la consulta ANTES de borrar la foto.
--   delete_my_account()     : borra todos los datos del usuario que la llama
--                             (auth.uid()) y su cuenta en auth.users, en una
--                             sola transacción: si algo falla, no se borra nada.
--
-- `security definer`: corre con los permisos del dueño (postgres) para poder
-- borrar de auth.users, pero SOLO actúa sobre auth.uid(): nadie puede borrar
-- la cuenta de otro. La foto de perfil (Storage) no se puede borrar desde SQL;
-- la borra la Server Action con la API de Storage (ver política al final).

-- === ¿Se puede eliminar? ===

create or replace function public.can_delete_my_account()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    return 'no_session';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  -- No se permite borrar la única cuenta de administrador.
  if v_role = 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    return 'last_admin';
  end if;

  return 'ok';
end;
$$;

-- === Borrado interno de todos los datos de un usuario ===
-- Lo usan delete_my_account() y admin_delete_user(). NO se puede llamar desde
-- la app (sin grant): solo desde otras funciones security definer.

create or replace function public.delete_user_data(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := p_uid;
  r record;
begin
  -- 1) Tablas conocidas del usuario (hijas antes que padres).
  delete from public.daily_win_logs     where user_id = v_uid;
  delete from public.daily_wins         where user_id = v_uid;
  delete from public.weight_logs        where user_id = v_uid;
  delete from public.user_routines      where user_id = v_uid;
  delete from public.user_routine_focus where user_id = v_uid;
  delete from public.user_meals         where user_id = v_uid;
  delete from public.user_meditations   where user_id = v_uid;

  -- 2) Cualquier otra tabla pública con columna user_id (por si se agregan
  --    tablas nuevas y nadie actualiza esta función).
  for r in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name = 'user_id'
      and t.table_type = 'BASE TABLE'
  loop
    execute format('delete from public.%I where user_id = $1', r.table_name) using v_uid;
  end loop;

  -- 3) Perfil y cuenta de acceso (sesiones e identidades caen en cascada en auth).
  delete from public.profiles where id = v_uid;
  delete from auth.users      where id = v_uid;
end;
$$;

revoke all on function public.delete_user_data(uuid) from public, anon, authenticated;

-- === Eliminar la propia cuenta ===

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_check text;
begin
  v_check := public.can_delete_my_account();
  if v_check <> 'ok' then
    raise exception using message = v_check, errcode = 'P0001';
  end if;

  perform public.delete_user_data(auth.uid());
end;
$$;

-- Solo usuarios autenticados pueden llamarlas.
revoke all on function public.can_delete_my_account() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.can_delete_my_account() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- === Storage: permitir que cada usuario borre su propia foto ===
-- (Ya existían lectura pública, subida y actualización; faltaba borrar.)

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

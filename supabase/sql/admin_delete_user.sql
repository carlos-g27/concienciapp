-- El admin elimina la cuenta de un USUARIO de forma completa y atómica.
--
-- Ejecutar en Supabase (SQL Editor) DESPUÉS de delete_my_account.sql (usa
-- public.delete_user_data). Se puede volver a correr.
--
-- Reglas (también se validan en la Server Action):
--   - solo un admin puede llamarla (is_admin());
--   - no sirve para borrarse a uno mismo (para eso está delete_my_account);
--   - no se puede borrar a otro admin;
--   - el usuario debe existir.

create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if not public.is_admin() then
    raise exception using message = 'not_admin', errcode = 'P0001';
  end if;

  if p_user_id = auth.uid() then
    raise exception using message = 'self', errcode = 'P0001';
  end if;

  select role into v_role from public.profiles where id = p_user_id;
  if not found then
    raise exception using message = 'not_found', errcode = 'P0001';
  end if;

  if v_role = 'admin' then
    raise exception using message = 'target_is_admin', errcode = 'P0001';
  end if;

  perform public.delete_user_data(p_user_id);
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- === Storage: el admin puede borrar la foto de cualquier usuario ===

drop policy if exists "Admins can delete avatars" on storage.objects;
create policy "Admins can delete avatars" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

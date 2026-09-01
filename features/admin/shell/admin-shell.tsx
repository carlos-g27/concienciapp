import { requireAdmin } from "@/lib/auth/require-admin";
import { getProfile } from "@/features/profile/queries";
import AdminShellFrame from "./admin-shell-frame";

/**
 * Shell server-first del área de administración: exige rol admin, carga el
 * perfil del admin en el servidor y renderiza el marco (sidebar + topbar).
 */
export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const profile = await getProfile(user.id);

  return (
    <AdminShellFrame
      profile={{ name: profile.name, email: profile.email, avatar_url: profile.avatar_url }}
    >
      {children}
    </AdminShellFrame>
  );
}

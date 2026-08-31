import { requireUser } from "@/lib/auth/require-user";
import { getShellData } from "./queries";
import ShellFrame from "./shell-frame";

/**
 * Shell server-first de las páginas de usuario: valida sesión, carga perfil +
 * disponibilidad de pilares en el servidor y renderiza el marco (sidebar +
 * topbar) alrededor del contenido de la página.
 */
export default async function UserShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const data = await getShellData(user.id);

  return <ShellFrame data={data}>{children}</ShellFrame>;
}

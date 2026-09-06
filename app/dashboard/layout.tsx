import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import UserShell from "@/features/shell/user-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El shell es server-first (carga perfil/pilares con requireUser -> cookies);
  // bajo cacheComponents ese acceso dinámico debe ir tras <Suspense>.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <UserShell>{children}</UserShell>
    </Suspense>
  );
}

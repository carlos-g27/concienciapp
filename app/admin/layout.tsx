import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import AdminShell from "@/features/admin/shell/admin-shell";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  // El shell admin es server-first (requireAdmin + carga de perfil vía cookies);
  // bajo cacheComponents ese acceso dinámico debe ir tras <Suspense>.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

import AdminShellLayout from "@/components/admin-component/dashboard/admin-layout";
import { ProfileProvider } from "@/hooks/use-profile";
import { Suspense } from "react";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  // La protección de acceso a /admin se realiza en el middleware.
  // Mantener este layout simple evita llamadas bloqueantes durante la renderización.
  return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
          <ProfileProvider>
            <AdminShellLayout>{children}</AdminShellLayout>
          </ProfileProvider>
        </Suspense>
      )
}

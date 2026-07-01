import AdminShellLayout from "@/components/admin-component/admin-layout";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  // La protección de acceso a /admin se realiza en el middleware.
  // Mantener este layout simple evita llamadas bloqueantes durante la renderización.
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
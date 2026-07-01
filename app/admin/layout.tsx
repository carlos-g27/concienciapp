import AdminShellLayout from "@/components/admin-component/admin-layout";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
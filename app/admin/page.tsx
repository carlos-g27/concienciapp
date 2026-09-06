import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminUsers } from "@/features/admin/dashboard/queries";
import AdminDashboardView from "@/features/admin/dashboard/components/admin-dashboard-view";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  await requireAdmin();
  const users = await getAdminUsers();

  return <AdminDashboardView initialUsers={users} />;
}

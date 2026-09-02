import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUserDetail } from "@/features/admin/users/queries";
import AdminUserProfileView from "@/features/admin/users/components/admin-user-profile-view";

export default function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <AdminUserProfileContent params={params} />
    </Suspense>
  );
}

async function AdminUserProfileContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const detail = await getUserDetail(userId);

  if (!detail) {
    return <p className="text-center text-muted-foreground py-10">Usuario no encontrado.</p>;
  }

  return <AdminUserProfileView profile={detail.profile} counts={detail.counts} />;
}

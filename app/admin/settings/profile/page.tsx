import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminOwnProfile } from "@/features/admin/settings/queries";
import AdminProfileView from "@/features/admin/settings/components/admin-profile-view";

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <AdminProfileContent />
    </Suspense>
  );
}

async function AdminProfileContent() {
  await requireAdmin();
  const profile = await getAdminOwnProfile();

  if (!profile) {
    return <p className="text-center text-muted-foreground py-10">No se pudo cargar tu perfil.</p>;
  }

  return <AdminProfileView initialProfile={profile} />;
}

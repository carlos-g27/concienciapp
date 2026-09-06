import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPilarSettingsAdmin } from "@/features/admin/settings/queries";
import AdminSettingsView from "@/features/admin/settings/components/admin-settings-view";

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}

async function AdminSettingsContent() {
  await requireAdmin();
  const pilares = await getPilarSettingsAdmin();

  return <AdminSettingsView initialPilares={pilares} />;
}

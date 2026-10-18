import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMeditations } from "@/features/admin/meditations/queries";
import MeditationsCatalogView from "@/features/admin/meditations/components/meditations-catalog-view";

export default function AdminMeditationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <MeditationsCatalogContent />
    </Suspense>
  );
}

async function MeditationsCatalogContent() {
  await requireAdmin();
  const items = await getMeditations();

  return <MeditationsCatalogView initialItems={items} />;
}

import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMeditation } from "@/features/admin/meditations/queries";
import MeditationForm from "@/features/admin/meditations/components/meditation-form";

export default function AdminCreateMeditationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <MeditationFormContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MeditationFormContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireAdmin();
  const { id } = await searchParams;
  const initialMeditation = id ? await getMeditation(id) : null;

  return <MeditationForm initialMeditation={initialMeditation} />;
}

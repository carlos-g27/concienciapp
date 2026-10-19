import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUserMeditationsForAdmin, getMeditationsForPicker } from "@/features/admin/mental/queries";
import AdminMentalView from "@/features/admin/mental/components/admin-mental-view";

export default function AdminMentalPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <AdminMentalContent params={params} />
    </Suspense>
  );
}

async function AdminMentalContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const [meditations, catalog] = await Promise.all([
    getUserMeditationsForAdmin(userId),
    getMeditationsForPicker(),
  ]);

  return <AdminMentalView userId={userId} initialMeditations={meditations} catalog={catalog} />;
}

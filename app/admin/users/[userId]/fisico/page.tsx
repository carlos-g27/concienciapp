import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUserRoutineForAdmin } from "@/features/admin/fisico/queries";
import { getExercises } from "@/features/admin/exercises/queries";
import AdminFisicoView from "@/features/admin/fisico/components/admin-fisico-view";

export default function AdminFisicoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <AdminFisicoContent params={params} />
    </Suspense>
  );
}

async function AdminFisicoContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const [{ routine, focus }, catalog] = await Promise.all([
    getUserRoutineForAdmin(userId),
    getExercises(),
  ]);

  return (
    <AdminFisicoView
      userId={userId}
      initialRoutine={routine}
      initialFocus={focus}
      catalog={catalog}
    />
  );
}

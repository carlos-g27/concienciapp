import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUserMealsForAdmin, getRecipesForPicker } from "@/features/admin/nutricion/queries";
import AdminNutricionView from "@/features/admin/nutricion/components/admin-nutricion-view";

export default function AdminNutricionPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <AdminNutricionContent params={params} />
    </Suspense>
  );
}

async function AdminNutricionContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const [meals, catalog] = await Promise.all([
    getUserMealsForAdmin(userId),
    getRecipesForPicker(),
  ]);

  return <AdminNutricionView userId={userId} initialMeals={meals} catalog={catalog} />;
}

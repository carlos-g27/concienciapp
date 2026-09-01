import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getExercises } from "@/features/admin/exercises/queries";
import ExercisesCatalogView from "@/features/admin/exercises/components/exercises-catalog-view";

export default function AdminExercisesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <ExercisesCatalogContent />
    </Suspense>
  );
}

async function ExercisesCatalogContent() {
  await requireAdmin();
  const items = await getExercises();

  return <ExercisesCatalogView initialItems={items} />;
}

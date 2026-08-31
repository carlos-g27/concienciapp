import { Suspense } from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserMeals } from "@/features/nutricion/queries";
import NutricionView from "@/features/nutricion/components/nutricion-view";

export default function PilarNutricionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <NutricionContent />
    </Suspense>
  );
}

async function NutricionContent() {
  const user = await requireUser();
  const meals = await getUserMeals(user.id);

  return <NutricionView initialMeals={meals} />;
}

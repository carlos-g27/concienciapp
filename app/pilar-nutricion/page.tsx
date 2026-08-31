import { Suspense } from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserMeals } from "@/features/nutricion/queries";
import { getPilarSettings } from "@/features/shell/queries";
import NutricionView from "@/features/nutricion/components/nutricion-view";
import PilarMaintenance from "@/components/ui/pilar-maintenance";

export default function PilarNutricionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <NutricionContent />
    </Suspense>
  );
}

async function NutricionContent() {
  const user = await requireUser();
  const pilares = await getPilarSettings();

  // Gate de mantenimiento en el servidor (antes vivía en el cliente).
  if (!pilares.nutricion) {
    return <PilarMaintenance pilarName="Pilar Nutrición" />;
  }

  const meals = await getUserMeals(user.id);

  return <NutricionView initialMeals={meals} />;
}

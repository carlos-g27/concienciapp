import { Suspense } from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserRoutine } from "@/features/fisico/queries";
import { getPilarSettings } from "@/features/shell/queries";
import FisicoView from "@/features/fisico/components/fisico-view";
import PilarMaintenance from "@/components/ui/pilar-maintenance";

export default function PilarFisicoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <FisicoContent />
    </Suspense>
  );
}

async function FisicoContent() {
  const user = await requireUser();
  const pilares = await getPilarSettings();

  // Gate de mantenimiento en el servidor (antes vivía en el cliente).
  if (!pilares.fisico) {
    return <PilarMaintenance pilarName="Pilar Físico" />;
  }

  const workoutDays = await getUserRoutine(user.id);

  return <FisicoView initialWorkoutDays={workoutDays} />;
}

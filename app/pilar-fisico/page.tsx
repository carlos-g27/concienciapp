import { Suspense } from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserRoutine } from "@/features/fisico/queries";
import FisicoView from "@/features/fisico/components/fisico-view";

export default function PilarFisicoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <FisicoContent />
    </Suspense>
  );
}

async function FisicoContent() {
  const user = await requireUser();
  const workoutDays = await getUserRoutine(user.id);

  return <FisicoView initialWorkoutDays={workoutDays} />;
}

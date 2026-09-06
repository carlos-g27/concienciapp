import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getExercise } from "@/features/admin/exercises/queries";
import ExerciseForm from "@/features/admin/exercises/components/exercise-form";

export default function AdminCreateExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <ExerciseFormContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExerciseFormContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireAdmin();
  const { id } = await searchParams;
  const initialExercise = id ? await getExercise(id) : null;

  return <ExerciseForm initialExercise={initialExercise} />;
}

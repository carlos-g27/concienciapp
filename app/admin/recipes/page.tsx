import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getRecipe } from "@/features/admin/recipes/queries";
import RecipeForm from "@/features/admin/recipes/components/recipe-form";

export default function AdminCreateRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><BrandLoader /></div>}>
      <RecipeFormContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RecipeFormContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  await requireAdmin();
  const { id, type } = await searchParams;
  const initialRecipe = id ? await getRecipe(id) : null;

  return <RecipeForm initialRecipe={initialRecipe} initialType={type} />;
}

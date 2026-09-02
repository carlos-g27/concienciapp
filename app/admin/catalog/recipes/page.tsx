import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getRecipes } from "@/features/admin/recipes/queries";
import RecipesCatalogView from "@/features/admin/recipes/components/recipes-catalog-view";

export default function AdminRecipesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <RecipesCatalogContent />
    </Suspense>
  );
}

async function RecipesCatalogContent() {
  await requireAdmin();
  const items = await getRecipes();

  return <RecipesCatalogView initialItems={items} />;
}

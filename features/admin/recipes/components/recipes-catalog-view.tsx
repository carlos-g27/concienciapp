"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { deleteRecipe } from "../actions";
import type { RecipeCatalogItem } from "../types";

interface RecipesCatalogViewProps {
  initialItems: RecipeCatalogItem[];
}

export default function RecipesCatalogView({ initialItems }: RecipesCatalogViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: `${r.calories} kcal`,
    imageUrl: r.image_url,
  }));

  const filtered = items.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/recipes?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = window.confirm(
      `¿Eliminar "${item.title}"? Esto también la quitará del plan de todos los usuarios que la tengan asignada.`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    const res = await deleteRecipe(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando receta:", res.error);
      alert("No se pudo eliminar la receta. Intenta de nuevo.");
    }
    setDeletingId(null);
  };

  return (
    <CatalogList
      title="Catálogo de recetas"
      subtitle="Todas las recetas disponibles para asignar a los usuarios"
      searchPlaceholder="Buscar receta..."
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={false}
      emptyMessage={
        initialItems.length === 0
          ? "Aún no has creado ninguna receta."
          : "No se encontraron recetas."
      }
      deletingId={deletingId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createLinkHref="/admin/recipes"
      createLinkLabel="+ Nueva receta"
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";

export default function AdminRecipesCatalog() {
  const supabase = createClient();
  const router = useRouter();

  const [recipes, setRecipes] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, name, calories, image_url")
        .order("name", { ascending: true });

      if (error) throw error;

      setRecipes(
        (data ?? []).map((r) => ({
          id: r.id,
          title: r.name,
          subtitle: `${r.calories} kcal`,
          imageUrl: r.image_url,
        }))
      );
    } catch (err) {
      console.error("Error cargando catálogo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filtered = recipes.filter((r) =>
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
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", item.id);
      if (error) throw error;
      setRecipes((prev) => prev.filter((r) => r.id !== item.id));
    } catch (err) {
      console.error("Error eliminando receta:", err);
      alert("No se pudo eliminar la receta. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CatalogList
      title="Catálogo de recetas"
      subtitle="Todas las recetas disponibles para asignar a los usuarios"
      searchPlaceholder="Buscar receta..."
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={isLoading}
      emptyMessage={
        recipes.length === 0
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
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";

export default function AdminExercisesCatalog() {
  const supabase = createClient();
  const router = useRouter();

  const [exercises, setExercises] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle")
        .order("name", { ascending: true });

      if (error) throw error;

      setExercises(
        (data ?? []).map((e) => ({ id: e.id, title: e.name, subtitle: e.muscle }))
      );
    } catch (err) {
      console.error("Error cargando catálogo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filtered = exercises.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/exercises?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = window.confirm(
      `¿Eliminar "${item.title}"? Esto también lo quitará de las rutinas de todos los usuarios que lo tengan asignado.`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      const { error } = await supabase.from("exercises").delete().eq("id", item.id);
      if (error) throw error;
      setExercises((prev) => prev.filter((e) => e.id !== item.id));
    } catch (err) {
      console.error("Error eliminando ejercicio:", err);
      alert("No se pudo eliminar el ejercicio. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CatalogList
      title="Catálogo de ejercicios"
      subtitle="Todos los ejercicios disponibles para asignar a los usuarios"
      searchPlaceholder="Buscar ejercicio..."
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={isLoading}
      emptyMessage={
        exercises.length === 0
          ? "Aún no has creado ningún ejercicio."
          : "No se encontraron ejercicios."
      }
      deletingId={deletingId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createLinkHref="/admin/exercises"
      createLinkLabel="+ Nuevo ejercicio"
    />
  );
}
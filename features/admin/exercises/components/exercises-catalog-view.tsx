"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { deleteExercise } from "../actions";
import type { ExerciseCatalogItem } from "../types";

interface ExercisesCatalogViewProps {
  initialItems: ExerciseCatalogItem[];
}

export default function ExercisesCatalogView({ initialItems }: ExercisesCatalogViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((e) => ({
    id: e.id,
    title: e.name,
    subtitle: e.muscle,
  }));

  const filtered = items.filter((e) =>
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
    const res = await deleteExercise(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando ejercicio:", res.error);
      alert("No se pudo eliminar el ejercicio. Intenta de nuevo.");
    }
    setDeletingId(null);
  };

  return (
    <CatalogList
      title="Catálogo de ejercicios"
      subtitle="Todos los ejercicios disponibles para asignar a los usuarios"
      searchPlaceholder="Buscar ejercicio..."
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={false}
      emptyMessage={
        initialItems.length === 0
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

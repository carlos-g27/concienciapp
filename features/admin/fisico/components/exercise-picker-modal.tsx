"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";
import { deleteExercise } from "@/features/admin/exercises/actions";
import type { CatalogExercise } from "../types";

interface ExercisePickerModalProps {
  catalog: CatalogExercise[];
  excludeIds: string[]; // ejercicios ya asignados al día activo, se ocultan del picker
  onSelect: (exercise: CatalogExercise) => void;
  onClose: () => void;
}

export default function ExercisePickerModal({
  catalog,
  excludeIds,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = catalog
    .filter((e) => !excludeIds.includes(e.id))
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const pickerItems: (PickerItem & { original: CatalogExercise })[] = filtered.map((exercise) => ({
    id: exercise.id,
    title: exercise.name,
    subtitle: exercise.muscle,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="2" />
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
        <path d="M7 21v-4" />
        <path d="M17 21v-4" />
      </svg>
    ),
    original: exercise,
  }));

  // --- Editar: navega a /admin/exercises con el id, para precargar el formulario ---
  const handleEdit = (exerciseId: string) => {
    router.push(`/admin/exercises?id=${exerciseId}`);
  };

  // --- Eliminar del catálogo vía Server Action (reutilizada de la Fase 6B) ---
  const handleDelete = async (item: PickerItem & { original: CatalogExercise }) => {
    const exercise = item.original;
    const confirmed = window.confirm(
      `¿Eliminar "${exercise.name}"? Esto también quitará el ejercicio de las rutinas de todos los usuarios que lo tengan asignado.`
    );
    if (!confirmed) return;

    setDeletingId(exercise.id);
    const res = await deleteExercise(exercise.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando ejercicio:", res.error);
      alert("No se pudo eliminar el ejercicio. Intenta de nuevo.");
    }
    setDeletingId(null);
  };

  return (
    <PickerModal
      title="Agregar ejercicio"
      searchPlaceholder="Buscar ejercicio..."
      search={search}
      onSearchChange={setSearch}
      items={pickerItems}
      isLoading={false}
      emptyMessage={
        catalog.length === 0
          ? "Aún no hay ejercicios en el catálogo."
          : "No se encontraron ejercicios."
      }
      deletingId={deletingId}
      onSelect={(item) => onSelect(item.original)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={onClose}
      footerPrompt="¿No encuentras el ejercicio?"
      createLinkHref="/admin/exercises"
      createLinkLabel="+ Crear nuevo ejercicio"
    />
  );
}

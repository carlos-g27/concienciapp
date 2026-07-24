"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";

// --- Tipos ---
export interface CatalogExercise {
  id: string;
  name: string;
  muscle: string;
}

interface ExercisePickerModalProps {
  excludeIds: string[]; // ejercicios ya asignados al día activo, se ocultan del picker
  onSelect: (exercise: CatalogExercise) => void;
  onClose: () => void;
}

export default function ExercisePickerModal({
  excludeIds,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const supabase = createClient();
  const router = useRouter();
  const [exercises, setExercises] = useState<CatalogExercise[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("id, name, muscle")
          .order("name", { ascending: true });

        if (error) throw error;
        setExercises(data ?? []);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filtered = exercises
    .filter((e) => !excludeIds.includes(e.id))
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  // Mapeamos los ejercicios al formato genérico de PickerItem
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

  // --- Eliminar: confirma, borra en Supabase y refresca la lista ---
  const handleDelete = async (item: PickerItem & { original: CatalogExercise }) => {
    const exercise = item.original;
    const confirmed = window.confirm(
      `¿Eliminar "${exercise.name}"? Esto también quitará el ejercicio de las rutinas de todos los usuarios que lo tengan asignado.`
    );
    if (!confirmed) return;

    setDeletingId(exercise.id);
    try {
      const { error } = await supabase.from("exercises").delete().eq("id", exercise.id);
      if (error) throw error;
      setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
    } catch (err) {
      console.error("Error eliminando ejercicio:", err);
      alert("No se pudo eliminar el ejercicio. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PickerModal
      title="Agregar ejercicio"
      searchPlaceholder="Buscar ejercicio..."
      search={search}
      onSearchChange={setSearch}
      items={pickerItems}
      isLoading={isLoading}
      emptyMessage={
        exercises.length === 0
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
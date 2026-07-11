"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ExercisePickerModal, { CatalogExercise } from "./exercise-picker-modal";
import styles from "./admin-fisico.module.css";

// --- Tipos ---
interface AssignedExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
}

type Day = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

const DAYS: { key: Day; label: string }[] = [
  { key: "lunes",     label: "Lunes" },
  { key: "martes",    label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves" },
  { key: "viernes",   label: "Viernes" },
];

const emptyRoutine: Record<Day, AssignedExercise[]> = {
  lunes: [], martes: [], miercoles: [], jueves: [], viernes: [],
};

const emptyFocus: Record<Day, string> = {
  lunes: "", martes: "", miercoles: "", jueves: "", viernes: "",
};

export default function AdminFisico() {
  const supabase = createClient();
  const params = useParams();
  const userId = params.userId as string;

  const [activeDay, setActiveDay] = useState<Day>("lunes");
  const [routine, setRoutine] = useState<Record<Day, AssignedExercise[]>>(emptyRoutine);
  const [dayFocus, setDayFocus] = useState<Record<Day, string>>(emptyFocus);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar rutina + enfoque del día existentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: routinesData, error: routinesError }, { data: focusData, error: focusError }] =
          await Promise.all([
            supabase
              .from("user_routines")
              .select("day, exercise_id, sets, reps, exercises(name, muscle)")
              .eq("user_id", userId),
            supabase
              .from("user_routine_focus")
              .select("day, focus")
              .eq("user_id", userId),
          ]);

        if (routinesError) throw routinesError;
        if (focusError) throw focusError;

        const loadedRoutine: Record<Day, AssignedExercise[]> = {
          lunes: [], martes: [], miercoles: [], jueves: [], viernes: [],
        };

        routinesData?.forEach((row: any) => {
          const day = row.day as Day;
          if (loadedRoutine[day]) {
            loadedRoutine[day].push({
              exerciseId: row.exercise_id,
              name: row.exercises?.name ?? "Ejercicio",
              muscle: row.exercises?.muscle ?? "",
              sets: row.sets,
              reps: row.reps,
            });
          }
        });

        const loadedFocus: Record<Day, string> = { ...emptyFocus };
        focusData?.forEach((row) => {
          const day = row.day as Day;
          loadedFocus[day] = row.focus ?? "";
        });

        setRoutine(loadedRoutine);
        setDayFocus(loadedFocus);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // --- Agregar ejercicio desde el picker ---
  const handleSelectExercise = (exercise: CatalogExercise) => {
    setRoutine((prev) => ({
      ...prev,
      [activeDay]: [
        ...prev[activeDay],
        { exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, sets: 3, reps: 10 },
      ],
    }));
    setIsPickerOpen(false);
  };

  // --- Quitar ejercicio del día activo ---
  const handleRemove = (exerciseId: string) => {
    setRoutine((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((e) => e.exerciseId !== exerciseId),
    }));
  };

  // --- Editar series/reps ---
  const handleUpdateField = (exerciseId: string, field: "sets" | "reps", value: number) => {
    setRoutine((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  };

  // --- Guardar rutina + enfoque completos ---
  const handleSaveRoutine = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Rutina: reemplazo completo
      const { error: deleteError } = await supabase
        .from("user_routines")
        .delete()
        .eq("user_id", userId);
      if (deleteError) throw deleteError;

      const routineRows = Object.entries(routine).flatMap(([day, exercises]) =>
        exercises.map((e) => ({
          user_id: userId,
          exercise_id: e.exerciseId,
          day,
          sets: e.sets,
          reps: e.reps,
        }))
      );

      if (routineRows.length > 0) {
        const { error: insertError } = await supabase.from("user_routines").insert(routineRows);
        if (insertError) throw insertError;
      }

      // Enfoque del día: upsert por día
      const focusRows = Object.entries(dayFocus).map(([day, focus]) => ({
        user_id: userId,
        day,
        focus,
      }));

      const { error: focusError } = await supabase
        .from("user_routine_focus")
        .upsert(focusRows, { onConflict: "user_id,day" });
      if (focusError) throw focusError;

      setSuccessMsg("Cambios guardados correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalAssigned = Object.values(routine).reduce((sum, day) => sum + day.length, 0);
  const activeExercises = routine[activeDay];

  return (
    <div className={styles.page}>

      <Link href={`/admin/users/${userId}`} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al perfil
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Editar rutina — Pilar Físico</h1>
          <p className={styles.pageSubtitle}>
            {totalAssigned} ejercicio{totalAssigned !== 1 ? "s" : ""} asignado{totalAssigned !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button onClick={handleSaveRoutine} disabled={isSaving || isLoading}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Tabs de días */}
      <div className={styles.dayTabs}>
        {DAYS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveDay(key)}
            className={`${styles.dayTab} ${activeDay === key ? styles.dayTabActive : ""}`}
          >
            {label}
            {routine[key].length > 0 && (
              <span className={styles.dayTabBadge}>{routine[key].length}</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-5">

          {/* Enfoque del día */}
          <div className={styles.focusField}>
            <Label htmlFor="focus">Enfoque del día</Label>
            <Input
              id="focus"
              type="text"
              placeholder="Ej: Pecho y Tríceps"
              value={dayFocus[activeDay]}
              onChange={(e) => setDayFocus((prev) => ({ ...prev, [activeDay]: e.target.value }))}
            />
          </div>

          {/* Lista de ejercicios asignados al día activo */}
          {isLoading ? (
            <div className={styles.loadingList}>
              {[...Array(3)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
            </div>
          ) : (
            <div className={styles.assignedList}>
              {activeExercises.length === 0 ? (
                <p className={styles.emptyDay}>Sin ejercicios asignados este día.</p>
              ) : (
                activeExercises.map((exercise) => (
                  <div key={exercise.exerciseId} className={styles.exerciseRow}>

                    <div className={styles.exerciseThumb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="2" />
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
                        <path d="M7 21v-4" />
                        <path d="M17 21v-4" />
                      </svg>
                    </div>

                    <div className={styles.exerciseInfo}>
                      <span className={styles.exerciseName}>{exercise.name}</span>
                      <span className={styles.exerciseMuscle}>{exercise.muscle}</span>
                      <div className={styles.exerciseFields}>
                        <div className={styles.fieldGroup}>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleUpdateField(exercise.exerciseId, "sets", Number(e.target.value))}
                            className={styles.fieldInput}
                          />
                          <span className={styles.fieldSuffix}>series</span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => handleUpdateField(exercise.exerciseId, "reps", Number(e.target.value))}
                            className={styles.fieldInput}
                          />
                          <span className={styles.fieldSuffix}>reps</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(exercise.exerciseId)}
                      className={styles.deleteBtn}
                      aria-label="Quitar ejercicio"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>

                  </div>
                ))
              )}
            </div>
          )}

          {/* Botón agregar ejercicio */}
          <button onClick={() => setIsPickerOpen(true)} className={styles.addExerciseBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar ejercicio
          </button>

        </CardContent>
      </Card>

      {/* Modal picker */}
      {isPickerOpen && (
        <ExercisePickerModal
          excludeIds={activeExercises.map((e) => e.exerciseId)}
          onSelect={handleSelectExercise}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

    </div>
  );
}
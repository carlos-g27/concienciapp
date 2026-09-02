"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TabbedCard, { TabItem } from "@/components/ui/tabbed-card";
import ExercisePickerModal from "./exercise-picker-modal";
import { saveUserRoutine } from "../actions";
import type { AssignedExercise, CatalogExercise, Day, FocusByDay, RoutineByDay } from "../types";
import styles from "./admin-fisico.module.css";

const DAYS: { key: Day; label: string }[] = [
  { key: "lunes",     label: "Lunes" },
  { key: "martes",    label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves" },
  { key: "viernes",   label: "Viernes" },
];

interface AdminFisicoViewProps {
  userId: string;
  initialRoutine: RoutineByDay;
  initialFocus: FocusByDay;
  catalog: CatalogExercise[];
}

export default function AdminFisicoView({ userId, initialRoutine, initialFocus, catalog }: AdminFisicoViewProps) {
  const [activeDay, setActiveDay] = useState<Day>("lunes");
  const [routine, setRoutine] = useState<RoutineByDay>(initialRoutine);
  const [dayFocus, setDayFocus] = useState<FocusByDay>(initialFocus);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleRemove = (exerciseId: string) => {
    setRoutine((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((e) => e.exerciseId !== exerciseId),
    }));
  };

  const handleUpdateField = (exerciseId: string, field: "sets" | "reps", value: number) => {
    setRoutine((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  };

  const handleSaveRoutine = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const routineRows = (Object.entries(routine) as [Day, AssignedExercise[]][]).flatMap(
      ([day, exercises]) =>
        exercises.map((e) => ({ exerciseId: e.exerciseId, day, sets: e.sets, reps: e.reps }))
    );
    const focusRows = (Object.entries(dayFocus) as [Day, string][]).map(([day, focus]) => ({
      day,
      focus,
    }));

    const res = await saveUserRoutine(userId, { routine: routineRows, focus: focusRows });

    if (res.success) {
      setSuccessMsg("Cambios guardados correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? "Error al guardar.");
    }

    setIsSaving(false);
  };

  const totalAssigned = Object.values(routine).reduce((sum, day) => sum + day.length, 0);
  const activeExercises = routine[activeDay];

  const tabItems: TabItem[] = DAYS.map((tab) => ({
    key: tab.key,
    label: tab.label,
    badge: routine[tab.key].length,
  }));

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
        <Button onClick={handleSaveRoutine} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <TabbedCard
        tabs={tabItems}
        activeTab={activeDay}
        onTabChange={(key) => setActiveDay(key as Day)}
      >
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

        {/* Botón agregar ejercicio */}
        <button onClick={() => setIsPickerOpen(true)} className={styles.addExerciseBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar ejercicio
        </button>
      </TabbedCard>

      {/* Modal picker */}
      {isPickerOpen && (
        <ExercisePickerModal
          catalog={catalog}
          excludeIds={activeExercises.map((e) => e.exerciseId)}
          onSelect={handleSelectExercise}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

    </div>
  );
}

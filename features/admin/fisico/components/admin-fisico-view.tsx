"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TabbedCard, { TabItem } from "@/components/ui/tabbed-card";
import MobileSaveBar from "@/components/ui/mobile-save-bar";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import ExercisePickerModal from "./exercise-picker-modal";
import { saveUserRoutine } from "../actions";
import type { AssignedExercise, CatalogExercise, Day, FocusByDay, RoutineByDay } from "../types";
import styles from "./admin-fisico.module.css";

const DAY_KEYS: Day[] = ["lunes", "martes", "miercoles", "jueves", "viernes"];

// El recuadro solo se mueve hacia arriba o abajo mientras se arrastra.
const soloVertical: Modifier = ({ transform }) => ({ ...transform, x: 0 });

// Evita que arrastrar desde un campo o botón mueva el recuadro (se puede
// escribir, seleccionar y borrar como siempre).
const noArrastrar = {
  onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onTouchStart: (e: React.SyntheticEvent) => e.stopPropagation(),
  onKeyDown: (e: React.SyntheticEvent) => e.stopPropagation(),
};

interface AdminFisicoViewProps {
  userId: string;
  initialRoutine: RoutineByDay;
  initialFocus: FocusByDay;
  catalog: CatalogExercise[];
}

export default function AdminFisicoView({ userId, initialRoutine, initialFocus, catalog }: AdminFisicoViewProps) {
  const t = useTranslations("adminAssign");
  const tf = useTranslations("fisico");
  const [activeDay, setActiveDay] = useState<Day>("lunes");
  const [routine, setRoutine] = useState<RoutineByDay>(initialRoutine);
  const [dayFocus, setDayFocus] = useState<FocusByDay>(initialFocus);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cambios sin guardar: rutina y enfoques actuales vs. últimos guardados.
  const currentValues = JSON.stringify({ routine, dayFocus });
  const [savedValues, setSavedValues] = useState(currentValues);
  const isDirty = currentValues !== savedValues;
  useUnsavedChangesWarning(isDirty);

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

  // --- Reordenar (arrastrar y soltar) ---
  // PC: mantener el clic y mover. Celular: mantener presionado ~¼ s y mover
  // (un deslizamiento normal sigue haciendo scroll). Teclado: Espacio + flechas.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setRoutine((prev) => {
      const list = prev[activeDay];
      const from = list.findIndex((e) => e.exerciseId === active.id);
      const to = list.findIndex((e) => e.exerciseId === over.id);
      return { ...prev, [activeDay]: arrayMove(list, from, to) };
    });
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
      setSavedValues(currentValues);
      setSuccessMsg(t("savedChanges"));
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? t("errSave"));
    }

    setIsSaving(false);
  };

  const totalAssigned = Object.values(routine).reduce((sum, day) => sum + day.length, 0);
  const activeExercises = routine[activeDay];

  const tabItems: TabItem[] = DAY_KEYS.map((key) => ({
    key,
    label: tf(`days.${key}`),
    shortLabel: tf(`daysShort.${key}`),
    badge: routine[key].length,
  }));

  return (
    <div className={styles.page}>

      <Link href={`/admin/users/${userId}`} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToProfile")}
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("fisicoTitle")}</h1>
          <p className={styles.pageSubtitle}>
            {t("assignedTotal", { count: totalAssigned })}
          </p>
        </div>
        {/* En móvil el botón va en la barra inferior (MobileSaveBar) */}
        <Button onClick={handleSaveRoutine} disabled={isSaving || !isDirty} className="hidden lg:inline-flex">
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>

      {successMsg && <div className={`${styles.successBanner} hidden lg:block`}>{successMsg}</div>}
      {error && <div className={`${styles.errorBanner} hidden lg:block`}>{error}</div>}

      <TabbedCard
        tabs={tabItems}
        activeTab={activeDay}
        onTabChange={(key) => setActiveDay(key as Day)}
      >
        {/* Enfoque del día */}
        <div className={styles.focusField}>
          <Label htmlFor="focus">{t("dayFocus")}</Label>
          <Input
            id="focus"
            type="text"
            placeholder={t("dayFocusPh")}
            value={dayFocus[activeDay]}
            onChange={(e) => setDayFocus((prev) => ({ ...prev, [activeDay]: e.target.value }))}
          />
        </div>

        {/* Lista de ejercicios asignados al día activo */}
        <div className={styles.assignedList}>
          {activeExercises.length === 0 ? (
            <p className={styles.emptyDay}>{t("emptyDay")}</p>
          ) : (
            <DndContext
              id="admin-routine-dnd"
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[soloVertical]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeExercises.map((e) => e.exerciseId)}
                strategy={verticalListSortingStrategy}
              >
                {activeExercises.map((exercise) => (
                  <SortableExerciseRow key={exercise.exerciseId} id={exercise.exerciseId}>
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
                      <div className={styles.exerciseFields} {...noArrastrar}>
                        <div className={styles.fieldGroup}>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleUpdateField(exercise.exerciseId, "sets", Number(e.target.value))}
                            className={styles.fieldInput}
                          />
                          <span className={styles.fieldSuffix}>{t("seriesSuffix")}</span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => handleUpdateField(exercise.exerciseId, "reps", Number(e.target.value))}
                            className={styles.fieldInput}
                          />
                          <span className={styles.fieldSuffix}>{t("repsSuffix")}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      {...noArrastrar}
                      onClick={() => handleRemove(exercise.exerciseId)}
                      className={styles.deleteBtn}
                      aria-label={t("removeExercise")}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </SortableExerciseRow>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Botón agregar ejercicio */}
        <button onClick={() => setIsPickerOpen(true)} className={styles.addExerciseBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("addExercise")}
        </button>
      </TabbedCard>

      <MobileSaveBar
        onSave={handleSaveRoutine}
        disabled={isSaving || !isDirty}
        isSaving={isSaving}
        label={t("save")}
        savingLabel={t("saving")}
        successMsg={successMsg}
        error={error}
      />

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

// --- Recuadro de ejercicio que se puede arrastrar para cambiar el orden ---
function SortableExerciseRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`${styles.exerciseRow} ${styles.sortableRow} ${isDragging ? styles.dragging : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

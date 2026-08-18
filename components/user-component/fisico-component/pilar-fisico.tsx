"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import SidebarLayout from "@/components/user-component/dashboard-logic/sidebar-config";
import ExercisePanel, { Exercise } from "./exercise-panel";
import Card from "@/components/ui/new-card";
import PilarMaintenance from "@/components/ui/pilar-maintenance";
import { usePilarSettings } from "@/hooks/use-pilar-settings";
import styles from "./fisico.module.css";

// --- Tipos ---
type Day = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

interface WorkoutDay {
  day: Day;
  displayName: string;
  label: string;
  exercises: Exercise[];
}

// --- Días de la semana (clave interna en Supabase → nombre visible) ---
const DAYS_ORDER: { key: Day; displayName: string }[] = [
  { key: "lunes",     displayName: "Lunes" },
  { key: "martes",    displayName: "Martes" },
  { key: "miercoles", displayName: "Miércoles" },
  { key: "jueves",    displayName: "Jueves" },
  { key: "viernes",   displayName: "Viernes" },
];

function getTodayKey(): Day {
  const map: Record<number, Day> = {
    1: "lunes",
    2: "martes",
    3: "miercoles",
    4: "jueves",
    5: "viernes",
  };
  return map[new Date().getDay()] ?? "lunes";
}

// --- Componente principal ---
export default function Fisico() {
  const supabase = createClient();

  const [todayKey, setTodayKey] = useState<Day>("lunes");
  const [expandedDay, setExpandedDay] = useState<Day | "">("lunes");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calcular el día actual solo en el cliente, evita el error de prerender con new Date()
  useEffect(() => {
    const calculatedToday = getTodayKey();
    setTodayKey(calculatedToday);
    setExpandedDay(calculatedToday);
  }, []);

  // Cargar la rutina real del usuario desde Supabase
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: routinesData, error: routinesError }, { data: focusData, error: focusError }] =
          await Promise.all([
            supabase
              .from("user_routines")
              .select("day, sets, reps, created_at, exercises(id, name, muscle, description, instructions, video_url, is_main_lift)")
              .eq("user_id", user.id),
            supabase
              .from("user_routine_focus")
              .select("day, focus")
              .eq("user_id", user.id),
          ]);

        if (routinesError) throw routinesError;
        if (focusError) throw focusError;

        const focusByDay: Record<string, string> = {};
        focusData?.forEach((row) => {
          focusByDay[row.day] = row.focus;
        });

        const days: WorkoutDay[] = DAYS_ORDER.map(({ key, displayName }) => {
          const exercisesForDay: Exercise[] = (routinesData ?? [])
            .filter((row: any) => row.day === key && row.exercises)
            .map((row: any) => ({
              id: row.exercises.id,
              name: row.exercises.name,
              muscle: row.exercises.muscle,
              sets: row.sets,
              reps: row.reps,
              description: row.exercises.description ?? "",
              instructions: row.exercises.instructions ?? [],
              video_url: row.exercises.video_url ?? null,
              is_main_lift: row.exercises.is_main_lift ?? false,
              assigned_at: row.created_at,
            }));

          return {
            day: key,
            displayName,
            label: focusByDay[key] ?? "",
            exercises: exercisesForDay,
          };
        });

        setWorkoutDays(days);
      } catch (err) {
        console.error("Error cargando rutina:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, []);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise((prev) => (prev?.id === exercise.id ? null : exercise));
  };

  const handleClosePanel = () => setSelectedExercise(null);

  const { pilares, isLoading: pilaresLoading } = usePilarSettings();

  // Si el pilar está desactivado por el admin, mostrar pantalla de mantenimiento
  if (!pilaresLoading && !pilares.fisico) {
    return (
      <SidebarLayout pageTitle="Físico">
        <PilarMaintenance pilarName="Pilar Físico" />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout pageTitle="Físico">
      <div className={styles.page}>

        {/* Vista: detalle de ejercicio (pantalla completa) */}
        {selectedExercise ? (
          <div className={styles.fullView}>
            {/* Botón volver */}
            <button
              onClick={handleClosePanel}
              className={styles.backBtn}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver a la rutina
            </button>

            {/* Panel ocupando todo el ancho */}
            <div className={styles.fullPanelWrapper}>
              <ExercisePanel
                exercise={selectedExercise}
                onClose={handleClosePanel}
              />
            </div>
          </div>

        ) : (

          /* Vista: lista de días */
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Mi Rutina</h1>
              <p className={styles.pageSubtitle}>
                Semana actual · {DAYS_ORDER.find((d) => d.key === todayKey)?.displayName} es tu día de entrenamiento
              </p>
            </div>

            {isLoading ? (
              <div className={styles.daysList}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.skeletonDayCard} />
                ))}
              </div>
            ) : (
              <div className={styles.daysList}>
                {workoutDays.map((workoutDay) => {
                  const isToday = workoutDay.day === todayKey;
                  const isExpanded = expandedDay === workoutDay.day;

                  return (
                    <div
                      key={workoutDay.day}
                      className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ""}`}
                    >
                      <button
                        className={styles.dayHeader}
                        onClick={() => setExpandedDay(isExpanded ? "" : workoutDay.day)}
                        aria-expanded={isExpanded}
                      >
                        <div className={styles.dayHeaderLeft}>
                          <span className={`${styles.dayName} ${isToday ? styles.dayNameToday : ""}`}>
                            {workoutDay.displayName}
                            {isToday && <span className={styles.todayBadge}>Hoy</span>}
                          </span>
                          <span className={styles.dayLabel}>
                            {workoutDay.label || "Sin enfoque asignado"}
                          </span>
                        </div>
                        <div className={styles.dayHeaderRight}>
                          <span className={styles.exerciseCount}>
                            {workoutDay.exercises.length} ejercicios
                          </span>
                          <svg
                            width="16" height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ""}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className={styles.exerciseList}>
                          {workoutDay.exercises.length === 0 ? (
                            <p className={styles.emptyDay}>Sin ejercicios asignados este día.</p>
                          ) : (
                            workoutDay.exercises.map((exercise) => (
                              <Card
                                key={exercise.id}
                                isSelected={false}
                                onClick={() => handleSelectExercise(exercise)}
                              >
                                <div className={styles.exerciseThumb}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.exerciseThumbIcon}>
                                    <circle cx="12" cy="8" r="2" />
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
                                    <path d="M7 21v-4" />
                                    <path d="M17 21v-4" />
                                  </svg>
                                </div>
                                <div className={styles.exerciseInfo}>
                                  <span className={styles.exerciseName}>{exercise.name}</span>
                                  <span className={styles.exerciseMeta}>{exercise.muscle}</span>
                                  <div className={styles.exerciseBadges}>
                                    <span className={styles.badge}>{exercise.sets} series</span>
                                    <span className={styles.badge}>{exercise.reps} reps</span>
                                  </div>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </SidebarLayout>
  );
}
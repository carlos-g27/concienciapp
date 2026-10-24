"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/new-card";
import PilarMaintenance from "@/components/ui/pilar-maintenance";
import ExercisePanel from "./exercise-panel";
import type { Day, Exercise, WorkoutDay } from "../types";
import styles from "./fisico.module.css";

// Icono del aviso "tu coach aún no te asignó…".
const NO_PLAN_ICON = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

// Sábado y domingo no son días de rutina: devuelve null.
function getTodayKey(): Day | null {
  const map: Record<number, Day> = {
    1: "lunes",
    2: "martes",
    3: "miercoles",
    4: "jueves",
    5: "viernes",
  };
  return map[new Date().getDay()] ?? null;
}

interface FisicoViewProps {
  initialWorkoutDays: WorkoutDay[];
}

export default function FisicoView({ initialWorkoutDays }: FisicoViewProps) {
  const t = useTranslations("fisico");
  // undefined = aún sin calcular (SSR / primer render); null = fin de semana.
  const [todayKey, setTodayKey] = useState<Day | null | undefined>(undefined);
  const [expandedDay, setExpandedDay] = useState<Day | "">("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Calcular el día actual solo en el cliente (evita desajustes de zona en SSR)
  useEffect(() => {
    const calculatedToday = getTodayKey();
    setTodayKey(calculatedToday);
    setExpandedDay(calculatedToday ?? "");
  }, []);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise((prev) => (prev?.id === exercise.id ? null : exercise));
  };

  const handleClosePanel = () => setSelectedExercise(null);

  return (
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
              {t("backToRoutine")}
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
              <h1 className={styles.pageTitle}>{t("title")}</h1>
              <p className={styles.pageSubtitle}>
                {todayKey === undefined
                  ? " "
                  : todayKey === null
                    ? t("weekendRest")
                    : t("currentWeek", { day: t(`days.${todayKey}`) })}
              </p>
            </div>

            {/* Sin rutina asignada: un aviso en vez de 5 días con "0 ejercicios" */}
            {initialWorkoutDays.every((d) => d.exercises.length === 0) ? (
              <PilarMaintenance title={t("noPlanTitle")} description={t("noPlanDesc")} icon={NO_PLAN_ICON} backLink={false} />
            ) : (
            <div className={styles.daysList}>
              {initialWorkoutDays.map((workoutDay) => {
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
                          {t(`days.${workoutDay.day}`)}
                          {isToday && <span className={styles.todayBadge}>{t("today")}</span>}
                        </span>
                        <span className={styles.dayLabel}>
                          {workoutDay.label || t("noFocus")}
                        </span>
                      </div>
                      <div className={styles.dayHeaderRight}>
                        <span className={styles.exerciseCount}>
                          {t("exercisesCount", { count: workoutDay.exercises.length })}
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
                          <p className={styles.emptyDay}>{t("emptyDay")}</p>
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
                                  <span className={styles.badge}>{t("setsBadge", { count: exercise.sets })}</span>
                                  <span className={styles.badge}>{t("repsBadge", { count: exercise.reps })}</span>
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
  );
}

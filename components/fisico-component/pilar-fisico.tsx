"use client";

import { useState, useMemo, useEffect } from "react";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import ExercisePanel, { Exercise } from "./exercise-panel";
import styles from "./fisico.module.css";

// --- Tipos ---
interface WorkoutDay {
  day: string;
  label: string;
  exercises: Exercise[];
}

// --- Datos mock ---
const WORKOUT_DAYS: WorkoutDay[] = [
  {
    day: "Lunes",
    label: "Pecho y Tríceps",
    exercises: [
      {
        id: "lun-1",
        name: "Press de Banca",
        muscle: "Pectoral Mayor • Tríceps",
        sets: 4,
        reps: 10,
        description:
          "Ejercicio compuesto que trabaja el pectoral mayor, el deltoides anterior y el tríceps. Es uno de los movimientos fundamentales para desarrollar fuerza y masa en la parte superior del cuerpo.",
        instructions: [
          "Acuéstate en el banco con los pies apoyados en el suelo.",
          "Agarra la barra con un agarre ligeramente más ancho que los hombros.",
          "Baja la barra controladamente hasta tocar el pecho.",
          "Empuja la barra hacia arriba hasta extender los brazos completamente.",
        ],
      },
      {
        id: "lun-2",
        name: "Fondos en Paralelas",
        muscle: "Tríceps • Pectoral",
        sets: 3,
        reps: 12,
        description:
          "Ejercicio de peso corporal que desarrolla la fuerza del tríceps y el pectoral inferior. Ideal para complementar el press de banca.",
        instructions: [
          "Sujétate a las barras paralelas con los brazos extendidos.",
          "Inclina ligeramente el torso hacia adelante para mayor activación del pectoral.",
          "Baja el cuerpo doblando los codos hasta los 90°.",
          "Empuja hacia arriba hasta la posición inicial.",
        ],
      },
      {
        id: "lun-3",
        name: "Aperturas con Mancuernas",
        muscle: "Pectoral Mayor",
        sets: 3,
        reps: 15,
        description:
          "Movimiento de aislamiento que estira y contrae el pectoral en todo su rango de movimiento. Excelente para definición y amplitud del pecho.",
        instructions: [
          "Acuéstate en el banco con una mancuerna en cada mano.",
          "Extiende los brazos por encima del pecho con una leve flexión de codos.",
          "Abre los brazos hacia los lados hasta sentir el estiramiento del pectoral.",
          "Vuelve a la posición inicial contrayendo el pecho.",
        ],
      },
    ],
  },
  {
    day: "Martes",
    label: "Espalda y Bíceps",
    exercises: [
      {
        id: "mar-1",
        name: "Dominadas",
        muscle: "Dorsal Ancho • Bíceps",
        sets: 4,
        reps: 8,
        description:
          "Ejercicio fundamental de tracción que desarrolla el ancho de la espalda y la fuerza del bíceps. Uno de los mejores movimientos para la parte superior del cuerpo.",
        instructions: [
          "Agarra la barra fija con un agarre prono, más ancho que los hombros.",
          "Cuelga con los brazos completamente extendidos.",
          "Tira del cuerpo hacia arriba hasta que el mentón supere la barra.",
          "Baja de forma controlada hasta la posición inicial.",
        ],
      },
      {
        id: "mar-2",
        name: "Remo con Barra",
        muscle: "Dorsal Ancho • Romboides",
        sets: 4,
        reps: 10,
        description:
          "Ejercicio compuesto de tracción horizontal que trabaja la espalda media y baja. Mejora la postura y el grosor de la espalda.",
        instructions: [
          "De pie, inclínate hacia adelante con la espalda recta.",
          "Agarra la barra con un agarre prono a la anchura de los hombros.",
          "Tira de la barra hacia el abdomen apretando los omóplatos.",
          "Baja la barra de forma controlada.",
        ],
      },
      {
        id: "mar-3",
        name: "Curl de Bíceps",
        muscle: "Bíceps Braquial",
        sets: 3,
        reps: 12,
        description:
          "Ejercicio de aislamiento clásico para el bíceps. Permite trabajar con rango completo de movimiento y máxima concentración muscular.",
        instructions: [
          "De pie, sujeta las mancuernas con agarre supino.",
          "Mantén los codos pegados al torso.",
          "Sube las mancuernas contrayendo el bíceps al máximo.",
          "Baja lentamente hasta la posición inicial.",
        ],
      },
    ],
  },
  {
    day: "Miércoles",
    label: "Piernas",
    exercises: [
      {
        id: "mie-1",
        name: "Sentadilla",
        muscle: "Cuádriceps • Glúteos • Isquiotibiales",
        sets: 4,
        reps: 10,
        description:
          "El rey de los ejercicios. Trabaja prácticamente todos los músculos del tren inferior y mejora la fuerza funcional general.",
        instructions: [
          "Coloca la barra sobre los trapecios con los pies a la anchura de los hombros.",
          "Mantén el pecho erguido y la espalda recta.",
          "Baja doblando rodillas y caderas hasta que los muslos queden paralelos al suelo.",
          "Empuja a través de los talones para volver a la posición inicial.",
        ],
      },
      {
        id: "mie-2",
        name: "Prensa de Piernas",
        muscle: "Cuádriceps • Glúteos",
        sets: 4,
        reps: 12,
        description:
          "Ejercicio complementario a la sentadilla que permite trabajar mayor carga con menor riesgo de lesión lumbar.",
        instructions: [
          "Siéntate en la máquina con los pies apoyados en la plataforma.",
          "Suelta los seguros y baja la plataforma doblando las rodillas a 90°.",
          "Empuja la plataforma hasta casi extender completamente las piernas.",
          "No bloquees las rodillas en el punto más alto.",
        ],
      },
      {
        id: "mie-3",
        name: "Peso Muerto Rumano",
        muscle: "Isquiotibiales • Glúteos",
        sets: 3,
        reps: 10,
        description:
          "Variante del peso muerto que pone énfasis en los isquiotibiales y glúteos. Mejora la flexibilidad y la fuerza posterior del tren inferior.",
        instructions: [
          "De pie, sujeta la barra con agarre prono frente a los muslos.",
          "Con las rodillas ligeramente flexionadas, inclínate hacia adelante.",
          "Baja la barra siguiendo las piernas hasta sentir el estiramiento.",
          "Activa los glúteos para volver a la posición erguida.",
        ],
      },
    ],
  },
  {
    day: "Jueves",
    label: "Hombros",
    exercises: [
      {
        id: "jue-1",
        name: "Press Militar",
        muscle: "Deltoides • Tríceps",
        sets: 4,
        reps: 10,
        description:
          "Ejercicio fundamental para el desarrollo de los hombros. Trabaja los tres haces del deltoides con énfasis en el haz anterior.",
        instructions: [
          "De pie o sentado, sujeta la barra a la altura del pecho.",
          "Empuja la barra hacia arriba hasta extender los brazos.",
          "Baja la barra de forma controlada hasta la posición inicial.",
          "Mantén el core activo durante todo el movimiento.",
        ],
      },
      {
        id: "jue-2",
        name: "Elevaciones Laterales",
        muscle: "Deltoides Lateral",
        sets: 3,
        reps: 15,
        description:
          "Ejercicio de aislamiento para el haz lateral del deltoides. Fundamental para lograr una amplitud de hombros estética.",
        instructions: [
          "De pie, sujeta las mancuernas a los lados del cuerpo.",
          "Eleva los brazos lateralmente hasta quedar paralelos al suelo.",
          "Mantén una leve flexión de codos durante todo el movimiento.",
          "Baja las mancuernas lentamente.",
        ],
      },
    ],
  },
  {
    day: "Viernes",
    label: "Core y Cardio",
    exercises: [
      {
        id: "vie-1",
        name: "Plancha",
        muscle: "Core • Abdomen",
        sets: 3,
        reps: 60,
        description:
          "Ejercicio isométrico que activa todo el núcleo del cuerpo. Mejora la estabilidad, la postura y la resistencia del core.",
        instructions: [
          "Apoya los antebrazos y los pies en el suelo.",
          "Mantén el cuerpo en línea recta de cabeza a talones.",
          "Activa el abdomen y los glúteos durante todo el tiempo.",
          "Respira de forma constante y controlada.",
        ],
      },
      {
        id: "vie-2",
        name: "Crunch Abdominal",
        muscle: "Recto Abdominal",
        sets: 4,
        reps: 20,
        description:
          "Ejercicio clásico para el abdomen que trabaja el recto abdominal. Ideal para fortalecer el núcleo y mejorar la definición abdominal.",
        instructions: [
          "Acuéstate boca arriba con las rodillas flexionadas.",
          "Coloca las manos detrás de la cabeza sin jalarte el cuello.",
          "Contrae el abdomen para elevar los hombros del suelo.",
          "Baja lentamente sin apoyar completamente la cabeza.",
        ],
      },
    ],
  },
];

// --- Días de la semana actuales ---
const DAYS_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function getTodayLabel(): string {
  const map: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
  };
  return map[new Date().getDay()] ?? "Lunes";
}

// --- Subcomponente: tarjeta de ejercicio ---
function ExerciseCard({
  exercise,
  isSelected,
  onClick,
}: {
  exercise: Exercise;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${styles.exerciseCard} ${isSelected ? styles.exerciseCardActive : ""}`}
    >
      {/* Imagen mock del ejercicio */}
      <div className={styles.exerciseThumb}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.exerciseThumbIcon}>
          <circle cx="12" cy="8" r="2" />
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
          <path d="M7 21v-4" />
          <path d="M17 21v-4" />
        </svg>
      </div>

      {/* Info */}
      <div className={styles.exerciseInfo}>
        <span className={styles.exerciseName}>{exercise.name}</span>
        <span className={styles.exerciseMeta}>
          {exercise.muscle}
        </span>
        <div className={styles.exerciseBadges}>
          <span className={styles.badge}>{exercise.sets} series</span>
          <span className={styles.badge}>{exercise.reps} reps</span>
        </div>
      </div>

      {/* Flecha */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.exerciseArrow}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

// --- Componente principal ---
export default function Fisico() {
  const [today, setToday] = useState<string>("Lunes");
  const [expandedDay, setExpandedDay] = useState<string>("Lunes");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Calcular el día actual solo en el cliente, evita el error de prerender con new Date()
  useEffect(() => {
    const calculatedToday = getTodayLabel();
    setToday(calculatedToday);
    setExpandedDay(calculatedToday);
  }, []);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise((prev) => (prev?.id === exercise.id ? null : exercise));
  };

  const handleClosePanel = () => setSelectedExercise(null);

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
              <p className={styles.pageSubtitle}>Semana actual · {today} es tu día de entrenamiento</p>
            </div>

            <div className={styles.daysList}>
              {DAYS_ORDER.map((dayName) => {
                const workoutDay = WORKOUT_DAYS.find((d) => d.day === dayName);
                if (!workoutDay) return null;

                const isToday = dayName === today;
                const isExpanded = expandedDay === dayName;

                return (
                  <div
                    key={dayName}
                    className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ""}`}
                  >
                    <button
                      className={styles.dayHeader}
                      onClick={() => setExpandedDay(isExpanded ? "" : dayName)}
                      aria-expanded={isExpanded}
                    >
                      <div className={styles.dayHeaderLeft}>
                        <span className={`${styles.dayName} ${isToday ? styles.dayNameToday : ""}`}>
                          {dayName}
                          {isToday && <span className={styles.todayBadge}>Hoy</span>}
                        </span>
                        <span className={styles.dayLabel}>{workoutDay.label}</span>
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
                        {workoutDay.exercises.map((exercise) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            isSelected={false}
                            onClick={() => handleSelectExercise(exercise)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </SidebarLayout>
  );
}
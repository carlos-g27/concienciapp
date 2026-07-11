"use client";

import { useState } from "react";
import styles from "./exercise-panel.module.css";

// --- Tipos ---
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  description: string;
  instructions: string[];
  video_url?: string | null;
}

// Estructura lista para mapear a una tabla 'weight_logs' en Supabase
export interface WeightLog {
  id: string;
  weight: number;
  date: string; // ISO string — se guardaría como timestamp en Supabase
}

interface ExercisePanelProps {
  exercise: Exercise | null;
  onClose: () => void;
}

// --- Helper: detecta el tipo de video y arma la URL de embed ---
function getVideoEmbedInfo(url: string): { type: "youtube" | "vimeo" | "file"; src: string } {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Cualquier otra URL se trata como archivo de video directo
  return { type: "file", src: url };
}

// --- Componente ---
export default function ExercisePanel({ exercise, onClose }: ExercisePanelProps) {
  const [weight, setWeight] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

  if (!exercise) return null;

  const videoInfo = exercise.video_url ? getVideoEmbedInfo(exercise.video_url) : null;

  const handleSaveWeight = () => {
    if (!weight) return;

    const newLog: WeightLog = {
      id: crypto.randomUUID(),
      weight: parseFloat(weight),
      date: new Date().toISOString(),
    };

    // Más reciente primero
    setWeightLogs((prev) => [newLog, ...prev]);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleWeightChange = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(0, current + delta);
    setWeight(String(next % 1 === 0 ? next : next.toFixed(1)));
  };

  // Formatea la fecha de forma corta y legible (ej: "17 jun, 14:32")
  const formatLogDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <aside className={styles.panel}>

      {/* Header del panel */}
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{exercise.name}</h2>
          <span className={styles.panelMuscle}>{exercise.muscle}</span>
        </div>
        <button
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Cerrar panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Video real si existe, si no, placeholder */}
      {videoInfo ? (
        <div className={styles.videoWrapper}>
          {videoInfo.type === "file" ? (
            <video
              controls
              className={styles.videoElement}
              src={videoInfo.src}
            />
          ) : (
            <iframe
              className={styles.videoElement}
              src={videoInfo.src}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className={styles.videoPlaceholder}>
          <div className={styles.playBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className={styles.videoLabel}>Vista previa del ejercicio</span>
        </div>
      )}

      {/* Series y reps */}
      <div className={styles.setsRow}>
        <div className={styles.setBadge}>
          <span className={styles.setBadgeValue}>{exercise.sets}</span>
          <span className={styles.setBadgeLabel}>Series</span>
        </div>
        <div className={styles.setBadgeDivider} />
        <div className={styles.setBadge}>
          <span className={styles.setBadgeValue}>{exercise.reps}</span>
          <span className={styles.setBadgeLabel}>Repeticiones</span>
        </div>
      </div>

      {/* Descripción */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Descripción</h3>
        <p className={styles.descriptionText}>{exercise.description}</p>
      </div>

      {/* Instrucciones */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Instrucciones</h3>
        <ul className={styles.instructionsList}>
          {exercise.instructions.map((step, i) => (
            <li key={i} className={styles.instructionItem}>
              <span className={styles.instructionDot} />
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* Control de peso */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Registro de peso</h3>
        <div className={styles.weightControl}>
          <button
            onClick={() => handleWeightChange(-2.5)}
            className={styles.weightBtn}
            aria-label="Reducir peso"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <div className={styles.weightInputWrapper}>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              min="0"
              className={styles.weightInput}
            />
            <span className={styles.weightUnit}>kg</span>
          </div>

          <button
            onClick={() => handleWeightChange(2.5)}
            className={styles.weightBtn}
            aria-label="Aumentar peso"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <button
          onClick={handleSaveWeight}
          disabled={!weight || saved}
          className={styles.saveWeightBtn}
        >
          {saved ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Guardado
            </>
          ) : (
            "Guardar peso"
          )}
        </button>

        {/* Historial de pesos registrados */}
        {weightLogs.length > 0 && (
          <div className={styles.weightHistory}>
            <span className={styles.weightHistoryTitle}>Progreso</span>
            <div className={styles.weightHistoryList}>
              {weightLogs.map((log) => (
                <div key={log.id} className={styles.weightHistoryRow}>
                  <span className={styles.weightHistoryDate}>
                    {formatLogDate(log.date)}
                  </span>
                  <span className={styles.weightHistoryValue}>
                    {log.weight} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
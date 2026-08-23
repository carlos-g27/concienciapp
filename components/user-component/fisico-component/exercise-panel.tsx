"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  is_main_lift?: boolean;   // true para Press de Banca, Peso Muerto, Sentadilla
  assigned_at?: string;     // fecha en que el admin asignó el ejercicio (referencia del ciclo RM)
}

// Estructura lista para mapear a una tabla 'weight_logs' en Supabase
export interface WeightLog {
  id: string;
  weight: number;
  date: string; // ISO string — se guardaría como timestamp en Supabase
  is_rm: boolean;
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

// --- Helper: calcula en qué "semana del ciclo" cae una fecha, contando
// desde assigned_at. El ciclo de RM se repite cada 4 semanas (semana 0, 4, 8...).
function getWeekIndex(assignedAt: string, date: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const start = new Date(assignedAt).getTime();
  const diff = date.getTime() - start;
  return Math.floor(diff / msPerWeek);
}

function isRMWeek(weekIndex: number): boolean {
  return weekIndex >= 0 && weekIndex % 4 === 0;
}

// --- Componente ---
export default function ExercisePanel({ exercise, onClose }: ExercisePanelProps) {
  const supabase = createClient();

  const [weight, setWeight] = useState<string>("");
  const [isRMToggle, setIsRMToggle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // --- Cargar historial real del usuario para este ejercicio ---
  useEffect(() => {
    if (!exercise) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data, error } = await supabase
          .from("weight_logs")
          .select("id, weight, created_at, is_rm")
          .eq("user_id", user.id)
          .eq("exercise_id", exercise.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setWeightLogs(
          (data ?? []).map((row) => ({
            id: row.id,
            weight: Number(row.weight),
            date: row.created_at,
            is_rm: row.is_rm ?? false,
          }))
        );
      } catch (err) {
        console.error("Error cargando historial de peso:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [exercise?.id]);

  if (!exercise) return null;

  const videoInfo = exercise.video_url ? getVideoEmbedInfo(exercise.video_url) : null;

  // ¿Esta semana le toca RM a este ejercicio? (solo para fuerza máxima)
  const isCurrentlyRMWeek =
    !!exercise.is_main_lift &&
    !!exercise.assigned_at &&
    isRMWeek(getWeekIndex(exercise.assigned_at, new Date()));

  const handleSaveWeight = async () => {
    if (!weight || !userId) return;

    const weightValue = parseFloat(weight);

    try {
      const { data, error } = await supabase
        .from("weight_logs")
        .insert({
          user_id: userId,
          exercise_id: exercise.id,
          weight: weightValue,
          is_rm: isRMToggle,
        })
        .select("id, weight, created_at, is_rm")
        .single();

      if (error) throw error;

      const newLog: WeightLog = {
        id: data.id,
        weight: Number(data.weight),
        date: data.created_at,
        is_rm: data.is_rm ?? false,
      };

      // Más reciente primero
      setWeightLogs((prev) => [newLog, ...prev]);

      setSaved(true);
      setIsRMToggle(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error guardando peso:", err);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    try {
      const { error } = await supabase.from("weight_logs").delete().eq("id", logId);
      if (error) throw error;
      setWeightLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch (err) {
      console.error("Error eliminando registro:", err);
    } finally {
      setDeletingId(null);
    }
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

        {/* Alerta: esta semana toca RM */}
        {isCurrentlyRMWeek && (
          <div className={styles.rmAlert}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Esta semana te toca registrar tu RM en este ejercicio.
          </div>
        )}

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

        {/* Toggle manual: el usuario marca si este peso es su RM */}
        {exercise.is_main_lift && (
          <label className={styles.rmToggleRow} htmlFor="isRmToggle">
            <span className={styles.rmToggleLabel}>¿Es tu RM?</span>
            <button
              type="button"
              id="isRmToggle"
              role="switch"
              aria-checked={isRMToggle}
              onClick={() => setIsRMToggle((prev) => !prev)}
              className={`${styles.rmSwitch} ${isRMToggle ? styles.rmSwitchOn : ""}`}
            >
              <span className={styles.rmSwitchThumb} />
            </button>
          </label>
        )}

        <button
          onClick={handleSaveWeight}
          disabled={!weight || saved || !userId}
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
        {isLoadingHistory ? (
          <div className={styles.weightHistory}>
            <span className={styles.weightHistoryTitle}>Progreso</span>
            <div className={styles.weightHistoryList}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.weightHistorySkeleton} />
              ))}
            </div>
          </div>
        ) : weightLogs.length > 0 && (
          <div className={styles.weightHistory}>
            <span className={styles.weightHistoryTitle}>Progreso</span>
            <div className={styles.weightHistoryList}>
              {weightLogs.map((log) => (
                <div
                  key={log.id}
                  className={`${styles.weightHistoryRow} ${log.is_rm ? styles.weightHistoryRowRM : ""}`}
                >
                  {log.is_rm && <span className={styles.rmBadge}>RM</span>}
                  <span className={styles.weightHistoryDate}>
                    {formatLogDate(log.date)}
                  </span>
                  <span className={styles.weightHistoryValue}>
                    {log.weight} kg
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    disabled={deletingId === log.id}
                    className={styles.weightHistoryDeleteBtn}
                    aria-label="Eliminar registro"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
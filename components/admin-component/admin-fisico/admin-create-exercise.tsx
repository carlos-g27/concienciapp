"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import styles from "./admin-create-exercise.module.css";

export default function AdminCreateExercise() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("id");
  const isEditMode = Boolean(exerciseId);

  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Modo edición: precargar los datos del ejercicio existente ---
  useEffect(() => {
    if (!exerciseId) return;

    const fetchExercise = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("exercises")
          .select("name, muscle, description, instructions, video_url")
          .eq("id", exerciseId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) return;

        setName(data.name ?? "");
        setMuscle(data.muscle ?? "");
        setDescription(data.description ?? "");
        setInstructions(
          data.instructions && data.instructions.length > 0 ? data.instructions : [""]
        );
        setVideoUrl(data.video_url ?? "");
      } catch (err) {
        console.error("Error cargando ejercicio:", err);
        setError("No se pudo cargar el ejercicio a editar.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  // --- Pasos dinámicos ---
  const handleStepChange = (index: number, value: string) => {
    setInstructions((prev) => prev.map((step, i) => (i === index ? value : step)));
  };

  const handleAddStep = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const handleRemoveStep = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Guardar (crear o actualizar) ejercicio ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !muscle.trim()) {
      setError("El nombre y el grupo muscular son obligatorios.");
      return;
    }

    setIsSaving(true);

    try {
      const cleanInstructions = instructions.map((s) => s.trim()).filter(Boolean);

      const payload = {
        name: name.trim(),
        muscle: muscle.trim(),
        description: description.trim() || null,
        instructions: cleanInstructions.length > 0 ? cleanInstructions : null,
        video_url: videoUrl.trim() || null,
      };

      if (isEditMode && exerciseId) {
        const { error: updateError } = await supabase
          .from("exercises")
          .update(payload)
          .eq("id", exerciseId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("exercises").insert(payload);

        if (insertError) throw insertError;
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el ejercicio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>

      <Link href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {isEditMode ? "Editar ejercicio" : "Crear nuevo ejercicio"}
        </h1>
        <p className={styles.pageSubtitle}>
          {isEditMode
            ? "Los cambios se aplicarán a todos los usuarios que tengan este ejercicio asignado"
            : "Este ejercicio quedará disponible en el catálogo global"}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className={styles.loadingText}>Cargando ejercicio...</p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Nombre */}
              <div className={styles.field}>
                <Label htmlFor="name">Nombre del ejercicio</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Press de Banca"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Grupo muscular */}
              <div className={styles.field}>
                <Label htmlFor="muscle">Grupo muscular</Label>
                <Input
                  id="muscle"
                  type="text"
                  placeholder="Pectoral Mayor • Tríceps"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  required
                />
              </div>

              {/* Descripción */}
              <div className={styles.field}>
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  placeholder="Explica brevemente qué trabaja este ejercicio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              {/* Video */}
              <div className={styles.field}>
                <Label htmlFor="video">URL del video</Label>
                <Input
                  id="video"
                  type="url"
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              {/* Instrucciones paso a paso */}
              <div className={styles.field}>
                <Label>Instrucciones paso a paso</Label>
                <div className={styles.stepsList}>
                  {instructions.map((step, i) => (
                    <div key={i} className={styles.stepRow}>
                      <span className={styles.stepNumber}>{i + 1}</span>
                      <Input
                        type="text"
                        placeholder={`Paso ${i + 1}...`}
                        value={step}
                        onChange={(e) => handleStepChange(i, e.target.value)}
                        className={styles.stepInput}
                      />
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(i)}
                          className={styles.stepRemoveBtn}
                          aria-label="Quitar paso"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddStep} className={styles.addStepBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar paso
                </button>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <Button type="submit" disabled={isSaving} className={styles.submitBtn}>
                {isSaving
                  ? isEditMode ? "Guardando..." : "Creando..."
                  : isEditMode ? "Guardar cambios" : "Crear ejercicio"}
              </Button>

            </form>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
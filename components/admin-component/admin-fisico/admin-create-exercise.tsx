"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFormLayout from "@/components/layout/admin-form-layout";

export default function AdminCreateExercise() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("id");
  const isEditMode = Boolean(exerciseId);

  const [isMainLift, setIsMainLift] = useState(false);
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
          .select("name, muscle, description, instructions, video_url, is_main_lift")
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
        setIsMainLift(data.is_main_lift ?? false);
      } catch (err) {
        console.error("Error cargando ejercicio:", err);
        setError("No se pudo cargar el ejercicio a editar.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, supabase]);

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
        is_main_lift: isMainLift,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el ejercicio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminFormLayout
      title={isEditMode ? "Editar ejercicio" : "Crear nuevo ejercicio"}
      subtitle={
        isEditMode
          ? "Los cambios se aplicarán a todos los usuarios que tengan este ejercicio asignado"
          : "Este ejercicio quedará disponible en el catálogo global"
      }
      isLoading={isLoading}
      isSaving={isSaving}
      loadingText="Cargando ejercicio..."
      submitText={isEditMode ? "Guardar cambios" : "Crear ejercicio"}
      savingText={isEditMode ? "Guardando..." : "Creando..."}
      error={error}
      onSubmit={handleSubmit}
    >
      {/* Nombre */}
      <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          placeholder="Explica brevemente qué trabaja este ejercicio..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          rows={3}
        />
      </div>

      {/* Video */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="video">URL del video</Label>
        <Input
          id="video"
          type="url"
          placeholder="https://..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>

      <label htmlFor="isMainLift" style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--secondary)',
        cursor: 'pointer'
      }}>
        <input
          id="isMainLift"
          type="checkbox"
          style={{
            width: '18px',
            height: '18px',
            marginTop: '0.15rem',
            accentColor: 'var(--primary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
          checked={isMainLift}
          onChange={(e) => setIsMainLift(e.target.checked)}
        />
        <div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--foreground)'
          }}>
            Ejercicio de fuerza máxima (RM)
          </span>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--muted-foreground)',
            marginTop: '0.2rem',
            lineHeight: 1.4
          }}>
            Activa el seguimiento de Repetición Máxima cada 4 semanas para este ejercicio.
          </p>
        </div>
      </label>

      {/* Instrucciones paso a paso */}
      <div className="flex flex-col gap-2">
        <Label>Instrucciones paso a paso</Label>
        <div className="flex flex-col gap-3">
          {instructions.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-foreground w-4 text-center">
                {i + 1}
              </span>
              <Input
                type="text"
                placeholder={`Paso ${i + 1}...`}
                value={step}
                onChange={(e) => handleStepChange(i, e.target.value)}
                className="flex-1"
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(i)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <button
          type="button"
          onClick={handleAddStep}
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-[0.8rem] font-semibold hover:bg-secondary hover:text-primary hover:border-ring transition-colors w-fit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar paso
        </button>
      </div>
    </AdminFormLayout>
  );
}
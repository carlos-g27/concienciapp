"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFormLayout from "@/components/layout/admin-form-layout";
import { createExercise, updateExercise } from "../actions";
import type { ExerciseFull } from "../types";

interface ExerciseFormProps {
  initialExercise: ExerciseFull | null;
}

export default function ExerciseForm({ initialExercise }: ExerciseFormProps) {
  const t = useTranslations("adminCatalog");
  const isEditMode = Boolean(initialExercise);

  const [isMainLift, setIsMainLift] = useState(initialExercise?.is_main_lift ?? false);
  const [name, setName] = useState(initialExercise?.name ?? "");
  const [muscle, setMuscle] = useState(initialExercise?.muscle ?? "");
  const [description, setDescription] = useState(initialExercise?.description ?? "");
  const [instructions, setInstructions] = useState<string[]>(
    initialExercise?.instructions && initialExercise.instructions.length > 0
      ? initialExercise.instructions
      : [""]
  );
  const [videoUrl, setVideoUrl] = useState(initialExercise?.video_url ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // --- Guardar (crear o actualizar) ejercicio vía Server Action ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !muscle.trim()) {
      setError(t("exReqError"));
      return;
    }

    setIsSaving(true);

    const input = { name, muscle, description, instructions, videoUrl, isMainLift };

    const res =
      isEditMode && initialExercise
        ? await updateExercise(initialExercise.id, input)
        : await createExercise(input);

    if (!res.success) {
      setError(res.error ?? t("exSaveError"));
    }

    setIsSaving(false);
  };

  return (
    <AdminFormLayout
      title={isEditMode ? t("exFormEditTitle") : t("exFormCreateTitle")}
      subtitle={isEditMode ? t("exFormEditSubtitle") : t("exFormCreateSubtitle")}
      isLoading={false}
      isSaving={isSaving}
      loadingText={t("exFormLoading")}
      submitText={isEditMode ? t("exFormSaveBtn") : t("exFormCreateBtn")}
      savingText={isEditMode ? t("exFormSaving") : t("exFormCreating")}
      error={error}
      onSubmit={handleSubmit}
    >
      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("exName")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("exNamePh")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Grupo muscular */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="muscle">{t("exMuscle")}</Label>
        <Input
          id="muscle"
          type="text"
          placeholder={t("exMusclePh")}
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          required
        />
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{t("exDesc")}</Label>
        <textarea
          id="description"
          placeholder={t("exDescPh")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          rows={3}
        />
      </div>

      {/* Video */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="video">{t("exVideo")}</Label>
        <Input
          id="video"
          type="url"
          placeholder={t("exVideoPh")}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-secondary">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {t("exRmTitle")}
          </span>
          <p className="text-xs text-muted-foreground leading-snug">
            {t("exRmDesc")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isMainLift}
          aria-label={t("exRmTitle")}
          onClick={() => setIsMainLift((prev) => !prev)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            isMainLift ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isMainLift ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Instrucciones paso a paso */}
      <div className="flex flex-col gap-2">
        <Label>{t("exInstructions")}</Label>
        <div className="flex flex-col gap-3">
          {instructions.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-foreground w-4 text-center">
                {i + 1}
              </span>
              <Input
                type="text"
                placeholder={t("exStepPh", { n: i + 1 })}
                value={step}
                onChange={(e) => handleStepChange(i, e.target.value)}
                className="flex-1"
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(i)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={t("exRemoveStep")}
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
          {t("exAddStep")}
        </button>
      </div>
    </AdminFormLayout>
  );
}

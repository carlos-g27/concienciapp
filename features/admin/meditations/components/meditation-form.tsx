"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFormLayout from "@/components/layout/admin-form-layout";
import { createMeditation, updateMeditation } from "../actions";
import {
  MEDITATION_CATEGORIES,
  MEDITATION_CATEGORY_LABEL_KEYS,
  isMeditationCategory,
  type Meditation,
  type MeditationCategory,
} from "../types";

interface MeditationFormProps {
  initialMeditation: Meditation | null;
}

export default function MeditationForm({ initialMeditation }: MeditationFormProps) {
  const router = useRouter();
  const t = useTranslations("adminCatalog");
  const isEditMode = Boolean(initialMeditation);

  const [name, setName] = useState(initialMeditation?.name ?? "");
  const [category, setCategory] = useState<MeditationCategory>(
    isMeditationCategory(initialMeditation?.category) ? initialMeditation.category : "ansiedad"
  );
  const [videoUrl, setVideoUrl] = useState(initialMeditation?.video_url ?? "");
  const [duration, setDuration] = useState(
    initialMeditation?.duration != null ? String(initialMeditation.duration) : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Guardar (crear o actualizar) meditación vía Server Action ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !videoUrl.trim() || !duration.trim()) {
      setError(t("medReqError"));
      return;
    }

    setIsSaving(true);

    const input = { name, category, videoUrl, duration };

    const res =
      isEditMode && initialMeditation
        ? await updateMeditation(initialMeditation.id, input)
        : await createMeditation(input);

    if (res.success) {
      router.back();
    } else {
      setError(res.error ?? t("medSaveError"));
      setIsSaving(false);
    }
  };

  return (
    <AdminFormLayout
      title={isEditMode ? t("medFormEditTitle") : t("medFormCreateTitle")}
      subtitle={isEditMode ? t("medFormEditSubtitle") : t("medFormCreateSubtitle")}
      isLoading={false}
      isSaving={isSaving}
      loadingText={t("medFormLoading")}
      submitText={isEditMode ? t("medFormSaveBtn") : t("medFormCreateBtn")}
      savingText={isEditMode ? t("medFormSaving") : t("medFormCreating")}
      error={error}
      onSubmit={handleSubmit}
    >
      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("medName")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("medNamePh")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="category">{t("medCategory")}</Label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value as MeditationCategory)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {MEDITATION_CATEGORIES.map((value) => (
            <option key={value} value={value}>{t(MEDITATION_CATEGORY_LABEL_KEYS[value])}</option>
          ))}
        </select>
      </div>

      {/* Link de YouTube */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="video">{t("medVideo")}</Label>
        <Input
          id="video"
          type="url"
          placeholder={t("medVideoPh")}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
      </div>

      {/* Duración (minutos) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="duration">{t("medDuration")}</Label>
        <Input
          id="duration"
          type="number"
          inputMode="numeric"
          min={1}
          max={600}
          step={1}
          placeholder={t("medDurationPh")}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>
    </AdminFormLayout>
  );
}

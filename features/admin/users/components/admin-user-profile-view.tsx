"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import { confirmLeave, useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import DangerDeleteZone from "@/components/ui/danger-delete-zone";
import { adminDeleteUser, updateUserProfile } from "../actions";
import { userUpdateSchema } from "../schema";
import { PROFILE_FIELD_ERROR_KEYS, invalidProfileFields, type ProfileField } from "@/features/profile/schema";
import { cn } from "@/lib/utils";
import type { AdminUserCounts, AdminUserDetail } from "../types";
import styles from "./admin-user-profile.module.css";

// --- Helpers ---
function getInitials(name: string): string {
  return name.trim().split(" ").filter(Boolean).slice(0, 2)
    .map((n) => n[0].toUpperCase()).join("");
}

// --- Iconos de pilares ---
const IconFisico = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" />
    <path d="M9 20l3-14 3 14" />
    <path d="M7 10h10" />
  </svg>
);

const IconNutricion = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const IconMental = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  </svg>
);

interface AdminUserProfileViewProps {
  profile: AdminUserDetail;
  counts: AdminUserCounts;
}

export default function AdminUserProfileView({ profile, counts }: AdminUserProfileViewProps) {
  const router = useRouter();
  const t = useTranslations("adminAssign");
  const userId = profile.id;

  const [draft, setDraft] = useState({ weight: profile.weight, age: profile.age, goal: profile.goal });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Campos con datos incorrectos (se marcan en rojo y se listan en el aviso).
  const tp = useTranslations("profile");
  const [invalidFields, setInvalidFields] = useState<ProfileField[]>([]);
  const shownError =
    invalidFields.length > 0
      ? invalidFields.map((f) => tp(PROFILE_FIELD_ERROR_KEYS[f])).join("\n")
      : error;
  const invalidClass = (field: ProfileField) =>
    cn(invalidFields.includes(field) && "border-red-600 focus-visible:ring-red-600");
  const editField = (field: "weight" | "age" | "goal", value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
    setInvalidFields((prev) => prev.filter((f) => f !== field));
  };

  // Cambios sin guardar: datos editados vs. últimos guardados.
  const currentValues = JSON.stringify(draft);
  const [savedValues, setSavedValues] = useState(currentValues);
  useUnsavedChangesWarning(currentValues !== savedValues);

  const goTo = (path: string) => {
    if (confirmLeave()) router.push(path);
  };

  const handleSave = async () => {
    // Valida con el mismo esquema del servidor y dice qué campos están mal.
    const invalid = invalidProfileFields(userUpdateSchema.safeParse(draft));
    setInvalidFields(invalid);
    if (invalid.length > 0) {
      setError(null);
      setSuccessMsg(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const res = await updateUserProfile(userId, draft);

    if (res.success) {
      setSavedValues(currentValues);
      setSuccessMsg(t("savedInfo"));
      setTimeout(() => setSuccessMsg(null), 3000);
      router.refresh();
    } else {
      setError(res.error ?? t("errSave"));
    }

    setIsSaving(false);
  };

  return (
    <div className={styles.page}>

      {/* Botón volver */}
      <Link href="/admin" className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToUsers")}
      </Link>

      {/* Card: perfil del usuario */}
      <Card>
        <CardContent className="pt-6">
          <div className={styles.profileHeader}>

            {/* Avatar */}
            <div className={styles.avatar}>
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.name} width={72} height={72} priority className="object-cover w-full h-full" />
              ) : (
                <span className={styles.avatarInitials}>{getInitials(profile.name)}</span>
              )}
            </div>

            {/* Nombre + email (solo lectura) */}
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{profile.name}</span>
              <span className={styles.profileEmail}>{profile.email}</span>
            </div>
          </div>

          {/* Campos editables */}
          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <Label htmlFor="weight">{t("weight")}</Label>
              <Input
                id="weight"
                type="number"
                placeholder={t("weightPh")}
                value={draft.weight}
                onChange={(e) => editField("weight", e.target.value)}
                aria-invalid={invalidFields.includes("weight")}
                className={invalidClass("weight")}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="age">{t("age")}</Label>
              <Input
                id="age"
                type="number"
                placeholder={t("agePh")}
                value={draft.age}
                onChange={(e) => editField("age", e.target.value)}
                aria-invalid={invalidFields.includes("age")}
                className={invalidClass("age")}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="goal">{t("goal")}</Label>
              <Input
                id="goal"
                type="text"
                placeholder={t("goalPh")}
                value={draft.goal}
                onChange={(e) => editField("goal", e.target.value)}
                aria-invalid={invalidFields.includes("goal")}
                className={invalidClass("goal")}
              />
            </div>
          </div>

          {/* Botón guardar + feedback */}
          <div className={styles.saveRow}>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("saving") : t("save")}
            </Button>
            {successMsg && <span className={styles.successMsg}>{successMsg}</span>}
            {shownError && (
              <span role="alert" className="text-[0.8rem] font-medium text-red-600 dark:text-red-400 whitespace-pre-line">
                {shownError}
              </span>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Category cards de pilares */}
      <div className={styles.categoryGrid}>
        <CategoryCard
          title={t("pillarFisico")}
          icon={<IconFisico />}
          footerPrimaryText={t("exercisesCount", { count: counts.exercises })}
          footerSecondaryText={t("editRoutine")}
          onClick={() => goTo(`/admin/users/${userId}/fisico`)}
        />
        <CategoryCard
          title={t("pillarNutricion")}
          icon={<IconNutricion />}
          footerPrimaryText={t("recipesCount", { count: counts.recipes })}
          footerSecondaryText={t("editPlan")}
          onClick={() => goTo(`/admin/users/${userId}/nutricion`)}
        />
        <CategoryCard
          title={t("pillarMental")}
          icon={<IconMental />}
          footerPrimaryText={t("meditationsCount", { count: counts.meditations })}
          footerSecondaryText={t("editMeditations")}
          onClick={() => goTo(`/admin/users/${userId}/mental`)}
        />
      </div>

      {/* Zona de peligro: eliminar al usuario (hay que escribir su correo) */}
      <DangerDeleteZone
        namespace="adminDeleteUser"
        confirmText={profile.email}
        onConfirm={(typedEmail) => adminDeleteUser(userId, typedEmail)}
      />

    </div>
  );
}

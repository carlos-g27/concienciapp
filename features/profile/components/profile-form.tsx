"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/hooks/use-profile";
import { updateProfile, uploadAvatar } from "../actions";
import type { UserProfileData } from "../types";
import styles from "./profile.module.css";

// --- Campos del formulario (orden y etiquetas) ---
const fields: { key: keyof Omit<UserProfileData, "avatar_url" | "email">; label: string; type: string; placeholder: string }[] = [
  { key: "name",   label: "Nombre",             type: "text",   placeholder: "Daniela" },
  { key: "phone",  label: "Número de teléfono", type: "tel",    placeholder: "+52 55 1234 5678" },
  { key: "age",    label: "Edad",               type: "number", placeholder: "28" },
  { key: "weight", label: "Peso (kg)",          type: "number", placeholder: "78" },
  { key: "goal",   label: "Objetivo",           type: "text",   placeholder: "Ganar músculo" },
];

interface ProfileFormProps {
  initialProfile: UserProfileData;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fuente de datos de la página: viene del servidor por props.
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);

  // Draft local para edición sin afectar la vista hasta guardar.
  const [draft, setDraft] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEdit = () => {
    setDraft({ ...profile });
    setIsEditing(true);
  };

  const handleChange = (key: keyof UserProfileData, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleCancel = () => {
    setDraft(null);
    setIsEditing(false);
    setError(null);
  };

  // --- Guardar cambios vía Server Action ---
  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("name", draft.name);
    formData.append("phone", draft.phone);
    formData.append("age", draft.age);
    formData.append("weight", draft.weight);
    formData.append("goal", draft.goal);

    const res = await updateProfile(formData);

    if (res.success) {
      setProfile((prev) => ({
        ...prev,
        name: draft.name,
        phone: draft.phone,
        age: draft.age,
        weight: draft.weight,
        goal: draft.goal,
      }));
      router.refresh(); // el shell server re-renderiza y el Sidebar refleja el cambio
      setIsEditing(false);
      setDraft(null);
      setSuccessMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? "Error al guardar.");
    }

    setIsSaving(false);
  };

  // --- Subir avatar vía Server Action ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación rápida en cliente (UX); el servidor revalida de forma real.
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no puede superar 2MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await uploadAvatar(formData);

    if (res.success && res.avatarUrl) {
      const urlWithCache = `${res.avatarUrl}?t=${Date.now()}`;
      setProfile((prev) => ({ ...prev, avatar_url: urlWithCache }));
      if (draft) setDraft((prev) => (prev ? { ...prev, avatar_url: urlWithCache } : prev));
      router.refresh(); // el shell server re-renderiza el Sidebar con el avatar nuevo
    } else {
      setError(res.error ?? "Error al subir la imagen.");
    }

    setIsUploadingAvatar(false);
    e.target.value = ""; // permite volver a elegir el mismo archivo
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Título — solo desktop */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mi perfil</h1>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

          {/* Header con gradiente y avatar */}
          <div className="bg-gradient-to-br from-primary to-muted-foreground pt-8 pb-16 flex justify-center">
            <div className="relative">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg overflow-hidden bg-accent flex items-center justify-center">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Foto de perfil"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-foreground select-none">
                    {getInitials(profile.name || "") || "?"}
                  </span>
                )}
              </div>

              {/* Botón cámara */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border-2 border-border shadow flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-60"
                aria-label="Cambiar foto de perfil"
              >
                {isUploadingAvatar ? (
                  <svg className="animate-spin w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </button>

              {/* Input file oculto */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Info y botón editar */}
          <div className="-mt-10 flex flex-col items-center gap-1 px-6 pb-6">
            <p className="text-lg font-bold text-foreground">{profile.name || "Sin nombre"}</p>

            {/* Botón editar / guardar / cancelar */}
            <div className="flex gap-3 mt-4">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition-colors disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <p className="mt-3 text-sm text-destructive text-center">{error}</p>
            )}
            {successMsg && (
              <p className="mt-3 text-sm text-green-600 text-center">{successMsg}</p>
            )}
          </div>

          {/* Campos del perfil */}
          <div className="px-6 pb-8 flex flex-col gap-3">

            {/* Email — siempre solo lectura */}
            <div className={styles.fieldCard}>
              <span className={styles.fieldLabel}>Correo</span>
              <span className={styles.fieldValue}>{profile.email || "—"}</span>
            </div>

            {/* Campos editables */}
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className={styles.fieldCard}>
                <span className={styles.fieldLabel}>{label}</span>
                {isEditing && draft ? (
                  <Input
                    type={type}
                    value={draft[key]}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={styles.fieldInput}
                    min={type === "number" ? "0" : undefined}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {profile[key] || "—"}
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
    </div>
  );
}

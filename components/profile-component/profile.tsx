"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import { useProfile, getInitials } from "@/hooks/use-profile";
import styles from "./profile.module.css";

// --- Tipos locales ---
interface ProfileDraft {
  name: string;
  email: string;
  phone: string;
  age: string;
  weight: string;
  goal: string;
  avatar_url: string;
}

// --- Campos del formulario (orden y etiquetas) ---
const fields: { key: keyof Omit<ProfileDraft, "avatar_url" | "email">; label: string; type: string; placeholder: string }[] = [
  { key: "name",   label: "Nombre",             type: "text",   placeholder: "Daniela" },
  { key: "phone",  label: "Número de teléfono", type: "tel",    placeholder: "+52 55 1234 5678" },
  { key: "age",    label: "Edad",               type: "number", placeholder: "28" },
  { key: "weight", label: "Peso (kg)",          type: "number", placeholder: "78" },
  { key: "goal",   label: "Objetivo",           type: "text",   placeholder: "Ganar músculo" },
];

// --- Componente principal ---
export default function Profile() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado global compartido
  const { profile, isLoading, refreshProfile, updateAvatar } = useProfile();

  // Draft local para edición sin afectar el estado global hasta guardar
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Obtener userId al montar (solo necesitamos el id para writes)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  // --- Abrir modo edición — inicializar draft desde el estado global ---
  const handleEdit = () => {
    if (!profile) return;
    setDraft({ ...profile });
    setIsEditing(true);
  };

  // --- Manejar cambios en el draft ---
  const handleChange = (key: keyof ProfileDraft, value: string) => {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  // --- Cancelar edición ---
  const handleCancel = () => {
    setDraft(null);
    setIsEditing(false);
    setError(null);
  };

  // --- Guardar cambios en Supabase ---
  const handleSave = async () => {
    if (!userId || !draft) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name:   draft.name   || null,
          phone:  draft.phone  || null,
          age:    draft.age    ? Number(draft.age)    : null,
          weight: draft.weight ? Number(draft.weight) : null,
          goal:   draft.goal   || null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Refrescar el estado global para que Sidebar también se actualice
      await refreshProfile();
      setIsEditing(false);
      setDraft(null);
      setSuccessMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Subir avatar a Supabase Storage ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validar tipo y tamaño (máx 2MB)
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

    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;

      // Subir al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      // Guardar la URL en profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Actualizar estado global (Sidebar se actualiza automáticamente)
      const urlWithCache = `${publicUrl}?t=${Date.now()}`;
      updateAvatar(urlWithCache);
      if (draft) setDraft((prev) => prev ? { ...prev, avatar_url: urlWithCache } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- Render ---
  return (
    <SidebarLayout pageTitle="Perfil">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Título — solo desktop */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-[#061A33] tracking-tight">Mi perfil</h1>
        </div>

        {isLoading ? (
          /* Skeleton */
          <div className="bg-white rounded-2xl border border-[#DBEBFF] shadow-sm p-8 flex flex-col items-center gap-4 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-[#DBEBFF]" />
            <div className="h-4 w-40 rounded bg-[#DBEBFF]" />
            <div className="h-3 w-52 rounded bg-[#DBEBFF]" />
            <div className="h-10 w-36 rounded-xl bg-[#DBEBFF] mt-2" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-16 rounded-xl bg-[#DBEBFF]" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DBEBFF] shadow-sm overflow-hidden">

            {/* Header con gradiente y avatar */}
            <div className="bg-gradient-to-br from-[#223966] to-[#528ACC] pt-8 pb-16 flex justify-center">
              <div className="relative">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#9BC7FF] flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile?.avatar_url}
                      alt="Foto de perfil"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white select-none">
                      {getInitials(profile?.name || "") || "?"}
                    </span>
                  )}
                </div>

                {/* Botón cámara */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#DBEBFF] shadow flex items-center justify-center hover:bg-[#DBEBFF] transition-colors disabled:opacity-60"
                  aria-label="Cambiar foto de perfil"
                >
                  {isUploadingAvatar ? (
                    <svg className="animate-spin w-4 h-4 text-[#528ACC]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#528ACC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </button>

                {/* Input file oculto */}
                <input
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
              <p className="text-lg font-bold text-[#061A33]">{profile?.name || "Sin nombre"}</p>

              {/* Botón editar / guardar / cancelar */}
              <div className="flex gap-3 mt-4">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#223966] text-white text-sm font-semibold hover:bg-[#061A33] transition-colors"
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
                      className="px-4 py-2.5 rounded-xl border border-[#DBEBFF] text-[#528ACC] text-sm font-semibold hover:bg-[#f4f8ff] transition-colors disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#223966] text-white text-sm font-semibold hover:bg-[#061A33] transition-colors disabled:opacity-60"
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
                <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
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
                <span className={styles.fieldValue}>{profile?.email || "—"}</span>
              </div>

              {/* Campos editables */}
              {fields.map(({ key, label, type, placeholder }) => (
                <div key={key} className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>{label}</span>
                  {isEditing && draft ? (
                    <input
                      type={type}
                      value={draft[key]}
                      placeholder={placeholder}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={styles.fieldInput}
                      min={type === "number" ? "0" : undefined}
                    />
                  ) : (
                    <span className={styles.fieldValue}>
                      {profile?.[key] || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
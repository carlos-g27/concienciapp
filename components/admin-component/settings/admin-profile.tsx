"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import styles from "./admin-profile.module.css";

// --- Tipos ---
interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

// --- Helpers ---
function getInitials(name: string): string {
  return name.trim().split(" ").filter(Boolean).slice(0, 2)
    .map((n) => n[0].toUpperCase()).join("");
}

export default function AdminProfileEdit() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailPendingMsg, setEmailPendingMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Cargar perfil del admin ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, email, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileError || !data) throw profileError;

        const loaded: AdminProfile = {
          id: data.id,
          name: data.name ?? "",
          email: data.email ?? user.email ?? "",
          avatar_url: data.avatar_url,
        };

        setProfile(loaded);
        setName(loaded.name);
        setEmail(loaded.email);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- Subir foto de perfil ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

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
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const urlWithCache = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithCache })
        .eq("id", profile.id);
      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: urlWithCache } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- Guardar nombre y, si cambió, iniciar el flujo de cambio de correo ---
  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    setEmailPendingMsg(null);

    try {
      // Nombre: se guarda directo en profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ name: name.trim() || null })
        .eq("id", profile.id);
      if (updateError) throw updateError;

      // Correo: solo si cambió, se dispara el flujo de confirmación de Supabase.
      // profiles.email NO se toca aquí — se sincroniza después de confirmar.
      const emailChanged = email.trim() !== profile.email;
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (emailError) throw emailError;

        setEmailPendingMsg(
          `Te enviamos un correo de confirmación a ${email.trim()}. Tu correo actual (${profile.email}) seguirá siendo válido hasta que confirmes el cambio.`
        );
      }

      setProfile((prev) => prev ? { ...prev, name: name.trim() } : prev);
      setSuccessMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>No se pudo cargar tu perfil.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Botón volver */}
      <Link href="/admin/settings" className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a configuración
      </Link>

      <div>
        <h1 className={styles.pageTitle}>Editar perfil</h1>
        <p className={styles.pageSubtitle}>Actualiza tu foto, nombre y correo de administrador</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name || "Avatar"}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className={styles.avatarInitials}>{getInitials(name || "?")}</span>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className={styles.cameraBtn}
                aria-label="Cambiar foto de perfil"
              >
                {isUploadingAvatar ? (
                  <svg className={styles.spinner} width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Nombre */}
          <div className={styles.field}>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Correo */}
          <div className={styles.field}>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className={styles.fieldHint}>
              Cambiar tu correo requiere confirmación por email antes de aplicarse.
            </span>
          </div>

          {/* Feedback */}
          {emailPendingMsg && <p className={styles.pendingMsg}>{emailPendingMsg}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
          {error && <p className={styles.errorMsg}>{error}</p>}

          <Button onClick={handleSave} disabled={isSaving} className={styles.saveBtn}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>

        </CardContent>
      </Card>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import styles from "./admin-user-profile.module.css";

// --- Tipos ---
interface UserProfile {
  id: string;
  name: string;
  email: string;
  weight: string;
  age: string;
  goal: string;
  avatar_url: string | null;
}

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

// --- Componente principal ---
export default function AdminUserProfile() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState({ weight: "", age: "", goal: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Conteos reales de asignaciones del usuario
  const [counts, setCounts] = useState({ exercises: 0, recipes: 0, meditations: 0 });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("id, name, email, weight, age, goal, avatar_url")
          .eq("id", userId)
          .single();

        if (fetchError || !data) throw fetchError;

        const loaded: UserProfile = {
          id: data.id,
          name: data.name ?? "Sin nombre",
          email: data.email ?? "",
          weight: data.weight ? String(data.weight) : "",
          age: data.age ? String(data.age) : "",
          goal: data.goal ?? "",
          avatar_url: data.avatar_url,
        };

        setProfile(loaded);
        setDraft({ weight: loaded.weight, age: loaded.age, goal: loaded.goal });
      } catch (err) {
        console.error("Error cargando usuario:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  // Cargar conteos reales de ejercicios, recetas y meditaciones asignadas
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          { count: exercisesCount },
          { count: recipesCount },
          { count: meditationsCount },
        ] = await Promise.all([
          supabase
            .from("user_routines")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("user_meals")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("user_meditations")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

        setCounts({
          exercises: exercisesCount ?? 0,
          recipes: recipesCount ?? 0,
          meditations: meditationsCount ?? 0,
        });
      } catch (err) {
        console.error("Error cargando conteos:", err);
      }
    };

    if (userId) fetchCounts();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          weight: draft.weight ? Number(draft.weight) : null,
          age: draft.age ? Number(draft.age) : null,
          goal: draft.goal || null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, ...draft } : prev);
      setSuccessMsg("Información actualizada correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Usuario no encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Botón volver */}
      <Link href="/admin" className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a usuarios
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
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={draft.weight}
                onChange={(e) => setDraft((d) => ({ ...d, weight: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                placeholder="28"
                value={draft.age}
                onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="goal">Objetivo</Label>
              <Input
                id="goal"
                type="text"
                placeholder="Ganar músculo"
                value={draft.goal}
                onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value }))}
              />
            </div>
          </div>

          {/* Botón guardar + feedback */}
          <div className={styles.saveRow}>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
            {successMsg && <span className={styles.successMsg}>{successMsg}</span>}
            {error && <span className={styles.errorMsg}>{error}</span>}
          </div>

        </CardContent>
      </Card>

      {/* Category cards de pilares */}
      <div className={styles.categoryGrid}>
        <CategoryCard
          title="Pilar Físico"
          icon={<IconFisico />}
          footerPrimaryText={`${counts.exercises} ejercicio${counts.exercises !== 1 ? "s" : ""}`}
          footerSecondaryText="Editar rutina"
          onClick={() => router.push(`/admin/users/${userId}/fisico`)}
        />
        <CategoryCard
          title="Pilar Nutrición"
          icon={<IconNutricion />}
          footerPrimaryText={`${counts.recipes} receta${counts.recipes !== 1 ? "s" : ""}`}
          footerSecondaryText="Editar plan"
          onClick={() => router.push(`/admin/users/${userId}/nutricion`)}
        />
        <CategoryCard
          title="Pilar Mental"
          icon={<IconMental />}
          footerPrimaryText={`${counts.meditations} meditacion${counts.meditations !== 1 ? "es" : ""}`}
          footerSecondaryText="Editar meditaciones"
          onClick={() => router.push(`/admin/users/${userId}/mental`)}
        />
      </div>

    </div>
  );
}
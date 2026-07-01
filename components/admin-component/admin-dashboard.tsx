"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminLayout from "./admin-layout";
import styles from "./admin-dashboard.module.css";

// --- Tipos ---
interface UserRow {
  id: string;
  name: string;
  email: string;
  weight: string | null;
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
  has_routine: boolean;
}

// --- Helpers ---
function getInitials(name: string): string {
  return name.trim().split(" ").filter(Boolean).slice(0, 2)
    .map((n) => n[0].toUpperCase()).join("");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// --- Subcomponente: Métrica ---
function MetricCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={styles.metricInfo}>
        <span className={styles.metricValue}>{value}</span>
        <span className={styles.metricLabel}>{label}</span>
      </div>
    </div>
  );
}

// --- Componente principal ---
export default function AdminDashboard() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Obtener todos los usuarios con role 'user'
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email, weight, goal, avatar_url, created_at")
          .eq("role", "user")
          .order("created_at", { ascending: false });

        if (!profiles) return;

        // Verificar cuáles tienen rutina asignada
        const { data: routines } = await supabase
          .from("user_routines")
          .select("user_id");

        const usersWithRoutine = new Set(routines?.map((r) => r.user_id) ?? []);

        setUsers(
          profiles.map((p) => ({
            ...p,
            has_routine: usersWithRoutine.has(p.id),
          }))
        );
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtro de búsqueda
  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Métricas
  const totalUsers = users.length;
  const newThisWeek = users.filter((u) => {
    const created = new Date(u.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;
  const withRoutine = users.filter((u) => u.has_routine).length;
  const withoutRoutine = totalUsers - withRoutine;

  return (
    <AdminLayout pageTitle="Panel Admin">
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Panel de administrador</h1>
            <p className={styles.pageSubtitle}>Gestiona los usuarios y su contenido asignado</p>
          </div>
        </div>

        {/* Métricas */}
        <div className={styles.metricsGrid}>
          <MetricCard
            label="Total usuarios"
            value={totalUsers}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <MetricCard
            label="Nuevos esta semana"
            value={newThisWeek}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <MetricCard
            label="Con rutina asignada"
            value={withRoutine}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <MetricCard
            label="Sin rutina asignada"
            value={withoutRoutine}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
        </div>

        {/* Buscador */}
        <div className={styles.searchWrapper}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Lista de usuarios */}
        <div className={styles.userList}>
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className={`${styles.userCard} animate-pulse`}>
                <div className={styles.userAvatar} style={{ background: "var(--secondary)" }} />
                <div className={styles.userInfo}>
                  <div className="h-3.5 w-32 rounded bg-secondary mb-2" />
                  <div className="h-3 w-48 rounded bg-secondary" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            filtered.map((user) => (
              <Link key={user.id} href={`/admin/users/${user.id}`} className={styles.userCard}>

                {/* Avatar */}
                <div className={styles.userAvatar}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={styles.userAvatarInitials}>
                      {getInitials(user.name ?? "?")}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name ?? "Sin nombre"}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                  <div className={styles.userMeta}>
                    {user.weight && <span className={styles.userMetaItem}>{user.weight} kg</span>}
                    {user.goal && <span className={styles.userMetaItem}>{user.goal}</span>}
                    <span className={styles.userMetaItem}>{formatDate(user.created_at)}</span>
                  </div>
                </div>

                {/* Badge rutina */}
                <div className={styles.userBadgeWrapper}>
                  <span className={`${styles.userBadge} ${user.has_routine ? styles.userBadgeActive : styles.userBadgePending}`}>
                    {user.has_routine ? "Rutina asignada" : "Sin rutina"}
                  </span>
                </div>

                {/* Flecha */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.userChevron}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>

              </Link>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
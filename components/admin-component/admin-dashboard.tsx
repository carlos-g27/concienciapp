"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

interface LeaderboardEntry {
  name: string;
  score: number;
  avatar: string;
}

// --- Datos mock del leaderboard (mismos que dashboard.tsx del usuario) ---
const leaderboard: LeaderboardEntry[] = [
  { name: "Ada Lovelace",      score: 27, avatar: "AL" },
  { name: "Mark Hopper",       score: 21, avatar: "MH" },
  { name: "Margaret Hamilton", score: 15, avatar: "MH" },
];

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

// --- Subcomponente: Card grande de "Usuarios Totales" (oscura) ---
function TotalUsersCard({ total }: { total: number }) {
  return (
    <Link href="/admin?filter=all" className={styles.totalCard}>
      <div className={styles.totalCardHeader}>
        <div className={styles.totalCardIconWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <span className={styles.totalCardLabel}>Usuarios Totales</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.totalCardArrow}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <span className={styles.totalCardValue}>{total}</span>
    </Link>
  );
}

// --- Subcomponente: Avatar con iniciales ---
function AvatarInitials({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted-foreground to-accent flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 tracking-wide">
      {initials}
    </div>
  );
}

// --- Subcomponente: Card pequeña de métrica con filtro ---
function FilterMetricCard({
  label,
  value,
  filter,
  icon,
}: {
  label: string;
  value: number;
  filter: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={`/admin?filter=${filter}`} className={styles.filterCard}>
      <div className={styles.filterCardTop}>
        <div className={styles.filterCardIcon}>{icon}</div>
        <span className={styles.filterCardLabel}>{label}</span>
      </div>
      <span className={styles.filterCardValue}>{value}</span>
      <span className={styles.filterCardLink}>
        Ver más
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </Link>
  );
}

// --- Componente principal ---
export default function AdminDashboard() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "all";

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email, weight, goal, avatar_url, created_at")
          .eq("role", "user")
          .order("created_at", { ascending: false });

        if (!profiles) return;

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

  // Filtro por métrica (query param) + búsqueda de texto combinados
  const filtered = users
    .filter((u) => {
      if (activeFilter === "with-routine") return u.has_routine;
      if (activeFilter === "without-routine") return !u.has_routine;
      return true; // "all"
    })
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

  // Métricas
  const totalUsers = users.length;
  const withRoutine = users.filter((u) => u.has_routine).length;
  const withoutRoutine = totalUsers - withRoutine;

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Panel de administrador</h1>
          <p className={styles.pageSubtitle}>Gestiona los usuarios y su contenido asignado</p>
        </div>
      </div>

      {/* Métricas: Total (oscura) + Con plan + Sin plan */}
      <div className={styles.metricsGrid}>
        <TotalUsersCard total={totalUsers} />

        <FilterMetricCard
          label="Con plan asignado"
          value={withRoutine}
          filter="with-routine"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />

        <FilterMetricCard
          label="Sin plan asignado"
          value={withoutRoutine}
          filter="without-routine"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* Grid: lista de usuarios + leaderboard */}
      <div className={styles.contentGrid}>

        {/* Columna izquierda: buscador + lista, todo dentro de una card */}
        <div className={styles.leftColumn}>
          <div className={styles.searchListCard}>

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

                  <div className={styles.userAvatar}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={styles.userAvatarInitials}>
                        {getInitials(user.name ?? "?")}
                      </span>
                    )}
                  </div>

                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name ?? "Sin nombre"}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                    <div className={styles.userMeta}>
                      {user.weight && <span className={styles.userMetaItem}>{user.weight} kg</span>}
                      {user.goal && <span className={styles.userMetaItem}>{user.goal}</span>}
                      <span className={styles.userMetaItem}>{formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  <div className={styles.userBadgeWrapper}>
                    <span className={`${styles.userBadge} ${user.has_routine ? styles.userBadgeActive : styles.userBadgePending}`}>
                      {user.has_routine ? "Con plan" : "Sin plan"}
                    </span>
                  </div>

                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.userChevron}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>

                </Link>
              ))
            )}
            </div>
          </div>
        </div>

        {/* Columna derecha — Leaderboard */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-full">
                  <h2 className="text-base font-bold text-primary mb-6">Leaderboard</h2>
                  <div className="flex flex-col gap-1">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors cursor-default"
                      >
                        <span
                          className={`w-5 text-center text-sm font-bold flex-shrink-0 ${
                            i === 0 ? "text-primary" : "text-accent"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <AvatarInitials initials={entry.avatar} />
                        <span className="flex-1 text-sm font-medium text-primary truncate">
                          {entry.name}
                        </span>
                        <span className="text-sm font-bold text-muted-foreground">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

      </div>
    </div>
  );
}
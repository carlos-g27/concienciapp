"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AdminUserRow } from "../types";
import styles from "./admin-dashboard.module.css";

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

// --- Subcomponente: Avatar con iniciales ---
function AvatarInitials({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted-foreground to-accent flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 tracking-wide">
      {initials}
    </div>
  );
}

// --- Subcomponente: Card grande de "Usuarios Totales" (oscura, usa Card) ---
function TotalUsersCard({ total }: { total: number }) {
  return (
    <Link href="/admin?filter=all">
      <Card className="rounded-[20px] border-0 bg-gradient-to-br from-[#223966] to-[#061A33] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-6 pb-0">
          <div className={styles.totalCardIconWrapper}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <CardTitle className="flex-1 text-sm font-bold text-white">
            Usuarios Totales
          </CardTitle>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.totalCardArrow}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </CardHeader>
        <CardContent className="pt-4">
          <span className={styles.totalCardValue}>{total}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- Subcomponente: Card pequeña de métrica con filtro (usa Card) ---
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
    <Link href={`/admin?filter=${filter}`}>
      <Card className="rounded-[20px] hover:border-ring hover:-translate-y-0.5 transition-all">
        <CardHeader className="flex flex-row items-center gap-2.5 space-y-0 p-5 pb-2">
          <div className={styles.filterCardIcon}>{icon}</div>
          <CardTitle className="text-sm font-bold text-foreground leading-snug">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-5 pb-5 flex flex-col gap-2">
          <span className={styles.filterCardValue}>{value}</span>
          <span className={styles.filterCardLink}>
            Ver más
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

interface AdminDashboardViewProps {
  initialUsers: AdminUserRow[];
}

// --- Componente principal ---
export default function AdminDashboardView({ initialUsers }: AdminDashboardViewProps) {
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "all";

  const [search, setSearch] = useState("");

  // Filtro por métrica (query param) + búsqueda de texto combinados
  const filtered = initialUsers
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
  const totalUsers = initialUsers.length;
  const withRoutine = initialUsers.filter((u) => u.has_routine).length;
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

        {/* Columna izquierda: buscador + lista, dentro de un Card */}
        <div className={styles.leftColumn}>
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">

              <div className={styles.searchWrapper}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.userList}>
                {filtered.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No se encontraron usuarios</p>
                  </div>
                ) : (
                  filtered.map((user) => (
                    <Link key={user.id} href={`/admin/users/${user.id}`} className={styles.userCard}>

                      <div className={styles.userAvatar}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name ?? ""} className="w-full h-full object-cover" />
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

            </CardContent>
          </Card>
        </div>

        {/* Columna derecha — Leaderboard, dentro de un Card */}
        <div className={styles.rightColumn}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-1">
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
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

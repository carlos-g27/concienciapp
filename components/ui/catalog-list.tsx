"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface CatalogItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: ReactNode;
}

interface CatalogListProps<T extends CatalogItem> {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  items: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  deletingId?: string | null;
  onEdit: (id: string) => void;
  onDelete: (item: T) => void;
  createLinkHref: string;
  createLinkLabel: string;
}

export default function CatalogList<T extends CatalogItem>({
  title,
  subtitle,
  searchPlaceholder = "Buscar...",
  search,
  onSearchChange,
  items,
  isLoading = false,
  emptyMessage = "No hay elementos en el catálogo.",
  deletingId,
  onEdit,
  onDelete,
  createLinkHref,
  createLinkLabel,
}: CatalogListProps<T>) {
  const router = useRouter();

  return (
    <div className="max-w-[680px] mx-auto flex flex-col gap-5 w-full">

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer bg-transparent border-none p-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      {/* Header + botón crear */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight">{title}</h1>
          <p className="text-[0.85rem] text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href={createLinkHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {createLinkLabel}
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative flex items-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-muted-foreground pointer-events-none">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista dentro de una Card */}
      <Card>
        <CardContent className="pt-4 pb-4 px-3 flex flex-col gap-1">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-[54px] rounded-xl bg-secondary animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <p className="text-center py-8 px-4 text-muted-foreground text-sm">
              {emptyMessage}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-secondary transition-colors"
              >
                {/* Info principal — solo informativo, no selecciona nada */}
                <div className="flex-1 flex items-center gap-3 min-w-0 p-0.5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9BC7FF] to-[#528ACC] text-white flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : item.icon ? (
                      item.icon
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                    )}
                  </div>
                </div>

                {/* Acciones: editar / eliminar */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(item.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-background text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                    aria-label={`Editar ${item.title}`}
                    title="Editar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    disabled={deletingId === item.id}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                    aria-label={`Eliminar ${item.title}`}
                    title="Eliminar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
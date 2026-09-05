"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

export interface PickerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: ReactNode;
}

interface PickerModalProps<T extends PickerItem> {
  title: string;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  items: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  deletingId?: string | null;
  onSelect: (item: T) => void;
  onEdit?: (id: string) => void;
  onDelete?: (item: T) => void;
  onClose: () => void;
  footerPrompt?: string;
  createLinkHref?: string;
  createLinkLabel?: string;
}

export default function PickerModal<T extends PickerItem>({
  title,
  searchPlaceholder,
  search,
  onSearchChange,
  items,
  isLoading = false,
  emptyMessage,
  deletingId,
  onSelect,
  onEdit,
  onDelete,
  onClose,
  footerPrompt,
  createLinkHref,
  createLinkLabel,
}: PickerModalProps<T>) {
  const t = useTranslations("adminCommon");
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-[440px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-base font-extrabold text-card-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label={t("close")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex items-center px-5 pb-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-8 text-muted-foreground pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="text"
            placeholder={searchPlaceholder ?? t("searchDefault")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-[54px] rounded-xl bg-secondary animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <p className="text-center py-8 px-4 text-muted-foreground text-sm">
              {emptyMessage ?? t("resultsEmpty")}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-secondary transition-colors"
              >
                {/* Selección principal */}
                <button
                  onClick={() => onSelect(item)}
                  className="flex-1 flex items-center gap-3 min-w-0 text-left bg-transparent border-0 cursor-pointer p-0.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9BC7FF] to-[#528ACC] text-white flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.icon ? (
                      item.icon
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </button>

                {/* Acciones: Editar y Eliminar */}
                <div className="flex items-center gap-1 shrink-0">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-background text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                      aria-label={t("editAria", { title: item.title })}
                      title={t("edit")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      disabled={deletingId === item.id}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                      aria-label={t("deleteAria", { title: item.title })}
                      title={t("delete")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Icono de agregar */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary shrink-0 ml-1"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {(footerPrompt || createLinkHref) && (
          <div className="p-4 px-5 border-t border-border flex items-center justify-between gap-2">
            {footerPrompt && (
              <p className="text-xs text-muted-foreground">{footerPrompt}</p>
            )}
            {createLinkHref && createLinkLabel && (
              <Link
                href={createLinkHref}
                className="text-xs font-bold text-primary hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                {createLinkLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// --- Tipos ---
export type DialogTone = "default" | "danger" | "info";

export interface DialogOptions {
  title: string;
  description?: string;
  /** default: confirmar (cambios sin guardar, cerrar sesión); danger: eliminar; info: solo avisa. */
  tone?: DialogTone;
  icon?: React.ReactNode;
  confirmLabel?: string;
  /** Si no se pasa, se usa "Cancelar" (salvo en `info`, que tiene un solo botón). */
  cancelLabel?: string;
}

interface AppDialogProps extends DialogOptions {
  onConfirm: () => void;
  onCancel: () => void;
  /** Mientras se ejecuta la acción: botones desactivados y texto de carga. */
  busy?: boolean;
  busyLabel?: string;
}

const ICONS: Record<DialogTone, React.ReactNode> = {
  default: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  danger: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

/**
 * Aviso con el estilo de la app (mismo diseño para todas las alertas):
 * tarjeta, icono, título, texto y botones. El foco empieza en la opción
 * segura; Escape o clic fuera cancelan.
 */
export function AppDialog({
  title,
  description,
  tone = "default",
  icon,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
  busyLabel,
}: AppDialogProps) {
  const t = useTranslations("common");
  const safeRef = useRef<HTMLButtonElement>(null);
  const isInfo = tone === "info";

  // Foco en la opción segura y Escape para cancelar.
  useEffect(() => {
    // Tras el foco que devuelve un menú desplegable al cerrarse.
    const id = setTimeout(() => safeRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [busy, onCancel]);

  // Portal al body: un contenedor con backdrop-blur encerraría el `fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={description ? "app-dialog-desc" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl flex flex-col gap-5 ${
          tone === "danger" ? "border-red-600/40" : "border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              tone === "danger" ? "bg-red-600/10 text-red-600 dark:text-red-400" : "bg-secondary text-primary"
            }`}
          >
            {icon ?? ICONS[tone]}
          </div>
          <div className="min-w-0">
            <h2 id="app-dialog-title" className="text-lg font-bold text-foreground break-words">
              {title}
            </h2>
            {description && (
              <p id="app-dialog-desc" className="text-sm text-muted-foreground mt-1 break-words">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          {!isInfo && (
            <Button ref={safeRef} variant="outline" onClick={onCancel} disabled={busy}>
              {cancelLabel ?? t("cancel")}
            </Button>
          )}
          <Button
            ref={isInfo ? safeRef : undefined}
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && busyLabel ? busyLabel : (confirmLabel ?? (isInfo ? t("understood") : t("accept")))}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// --- Uso desde cualquier parte: `await confirmDialog({...})` ---

interface DialogRequest extends DialogOptions {
  resolve: (confirmed: boolean) => void;
}

let showDialog: ((request: DialogRequest) => void) | null = null;

/** Abre el aviso de la app y resuelve `true` si se confirma. */
export function confirmDialog(options: DialogOptions): Promise<boolean> {
  // Respaldo si el host aún no está montado (no debería pasar).
  if (!showDialog) return Promise.resolve(window.confirm(options.description ?? options.title));
  return new Promise((resolve) => showDialog?.({ ...options, resolve }));
}

/** Aviso informativo con un solo botón ("Entendido"). */
export async function alertDialog(options: Omit<DialogOptions, "tone" | "cancelLabel">): Promise<void> {
  await confirmDialog({ ...options, tone: "info" });
}

/** Se monta una vez en el layout raíz; muestra los avisos pedidos con confirmDialog. */
export function ConfirmDialogHost() {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  useEffect(() => {
    showDialog = (next) =>
      setRequest((prev) => {
        prev?.resolve(false); // si había otro abierto, se cancela
        return next;
      });
    return () => {
      showDialog = null;
    };
  }, []);

  if (!request) return null;

  const close = (confirmed: boolean) => {
    request.resolve(confirmed);
    setRequest(null);
  };

  return <AppDialog {...request} onConfirm={() => close(true)} onCancel={() => close(false)} />;
}

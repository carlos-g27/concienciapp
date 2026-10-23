"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { confirmLeave } from "@/hooks/use-unsaved-changes";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface LogoutButtonProps {
  /** "icon": solo el icono (barra lateral de PC). Por defecto, botón con texto. */
  variant?: "button" | "icon";
}

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Aviso "¿Cerrar sesión?" con el estilo de la app, para evitar cerrar sesión
 * por un clic accidental. Al confirmar cierra la sesión solo en este
 * dispositivo y lleva al login. Lo usan LogoutButton y los menús de cuenta.
 */
export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Foco en "Cancelar" (la opción segura) y Escape para cerrar.
  useEffect(() => {
    if (!open) return;
    // Tras el foco que devuelve el menú desplegable al cerrarse.
    const id = setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const logout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    // Solo este dispositivo: no cierra la sesión de la misma cuenta en otros.
    await supabase.auth.signOut({ scope: "local" });
    // Next conserva el shell (Activity): dejar el aviso cerrado al volver.
    setIsLoggingOut(false);
    onOpenChange(false);
    router.push("/auth/login");
  };

  // Portal al body: el topbar móvil tiene backdrop-blur y encerraría el `fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !isLoggingOut && onOpenChange(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col gap-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <LogOut size={18} aria-hidden />
          </div>
          <div>
            <h2 id="logout-confirm-title" className="text-lg font-bold text-foreground">
              {t("logoutConfirmTitle")}
            </h2>
            <p id="logout-confirm-desc" className="text-sm text-muted-foreground mt-1">
              {t("logoutConfirmBody")}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button ref={cancelRef} variant="outline" onClick={() => onOpenChange(false)} disabled={isLoggingOut}>
            {t("cancel")}
          </Button>
          <Button onClick={logout} disabled={isLoggingOut}>
            {isLoggingOut ? t("loggingOut") : t("logout")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function LogoutButton({ variant = "button" }: LogoutButtonProps) {
  const t = useTranslations("auth");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const askLogout = () => {
    if (!confirmLeave()) return; // cambios sin guardar en la vista actual
    setConfirmOpen(true);
  };

  const dialog = <LogoutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} />;

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={askLogout}
          title={t("logout")}
          aria-label={t("logout")}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-accent transition-colors hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut size={18} aria-hidden />
        </button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <Button onClick={askLogout}>{t("logout")}</Button>
      {dialog}
    </>
  );
}

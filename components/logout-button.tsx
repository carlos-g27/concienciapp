"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/ui/confirm-dialog";
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
 * Aviso "¿Cerrar sesión?" (mismo diseño que el resto de alertas de la app),
 * para evitar cerrar sesión por un clic accidental. Al confirmar cierra la
 * sesión solo en este dispositivo y lleva al login. Lo usan LogoutButton y los
 * menús de cuenta.
 */
export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <AppDialog
      title={t("logoutConfirmTitle")}
      description={t("logoutConfirmBody")}
      icon={<LogOut size={18} aria-hidden />}
      confirmLabel={t("logout")}
      cancelLabel={t("cancel")}
      busy={isLoggingOut}
      busyLabel={t("loggingOut")}
      onConfirm={logout}
      onCancel={() => onOpenChange(false)}
    />
  );
}

export function LogoutButton({ variant = "button" }: LogoutButtonProps) {
  const t = useTranslations("auth");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const askLogout = async () => {
    if (!(await confirmLeave())) return; // cambios sin guardar en la vista actual
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

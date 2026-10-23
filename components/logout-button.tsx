"use client";

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

export function LogoutButton({ variant = "button" }: LogoutButtonProps) {
  const router = useRouter();
  const t = useTranslations("auth");

  const logout = async () => {
    if (!confirmLeave()) return; // cambios sin guardar en la vista actual
    const supabase = createClient();
    // Solo este dispositivo: no cierra la sesión de la misma cuenta en otros.
    await supabase.auth.signOut({ scope: "local" });
    router.push("/auth/login");
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={logout}
        title={t("logout")}
        aria-label={t("logout")}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-accent transition-colors hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut size={18} aria-hidden />
      </button>
    );
  }

  return <Button onClick={logout}>{t("logout")}</Button>;
}

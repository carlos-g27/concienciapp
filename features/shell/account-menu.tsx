"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogoutConfirmDialog } from "@/components/logout-button";
import { confirmLeave } from "@/hooks/use-unsaved-changes";
import { getInitials } from "@/hooks/use-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShellProfile } from "./types";

interface AccountMenuProps {
  profile: ShellProfile;
}

/**
 * Menú de cuenta del topbar móvil: el avatar despliega Perfil, Ajustes y
 * Cerrar sesión. Sustituye al drawer lateral, que ahora es solo de escritorio.
 */
export default function AccountMenu({ profile }: AccountMenuProps) {
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");

  const [confirmLogout, setConfirmLogout] = useState(false);

  // Pide confirmación (aviso de la app) antes de cerrar sesión.
  const handleLogout = () => {
    if (confirmLeave()) setConfirmLogout(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex-shrink-0 rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={tNav("openMenu")}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#528ACC] to-[#9BC7FF] text-white text-sm font-bold shadow-sm select-none overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              getInitials(profile.name ?? "?") || "?"
            )}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
        // Si se abre el aviso de cerrar sesión, el foco se queda en él (no vuelve al avatar).
        onCloseAutoFocus={(e) => confirmLogout && e.preventDefault()}
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground">
            {profile.name || "Usuario"}
          </span>
          <span className="text-xs font-normal text-muted-foreground truncate">
            {profile.email || ""}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            {tNav("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            {tNav("settings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {tAuth("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Fuera del contenido del menú: sigue montado cuando el menú se cierra */}
      <LogoutConfirmDialog open={confirmLogout} onOpenChange={setConfirmLogout} />
    </DropdownMenu>
  );
}

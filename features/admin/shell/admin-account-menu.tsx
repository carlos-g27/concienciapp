"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/hooks/use-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShellProfile } from "@/features/shell/types";

interface AdminAccountMenuProps {
  profile: ShellProfile;
}

/**
 * Menú de cuenta del topbar móvil del admin: el avatar despliega Perfil,
 * Ajustes y Cerrar sesión. Sustituye al drawer, que ahora es solo de escritorio.
 */
export default function AdminAccountMenu({ profile }: AdminAccountMenuProps) {
  const router = useRouter();
  const t = useTranslations("adminNav");
  const tAuth = useTranslations("auth");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex-shrink-0 rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={t("openMenu")}
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

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground">
            {profile.name || t("adminLabel")}
          </span>
          <span className="text-xs font-normal text-muted-foreground truncate">
            {profile.email || ""}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/settings/profile" className="cursor-pointer">
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            {t("settings")}
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
    </DropdownMenu>
  );
}

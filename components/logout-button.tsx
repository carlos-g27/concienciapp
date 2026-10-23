"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("auth");

  const logout = async () => {
    const supabase = createClient();
    // Solo este dispositivo: no cierra la sesión de la misma cuenta en otros.
    await supabase.auth.signOut({ scope: "local" });
    router.push("/auth/login");
  };

  return <Button onClick={logout}>{t("logout")}</Button>;
}

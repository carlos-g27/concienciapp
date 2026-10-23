"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PHONE_REGEX, onlyPhoneDigits } from "@/features/profile/schema";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!PHONE_REGEX.test(phone)) {
      setError(t("phoneInvalid"));
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError(t("passwordsNoMatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
          data: { 
            name,
            phone,
           },
        },
      });

      if (error) throw error;

      // Si "Confirm email" está apagado en Supabase, el registro ya abre sesión:
      // se cierra para que el usuario siempre entre por el inicio de sesión.
      if (data.session) {
        await supabase.auth.signOut();
        router.replace("/auth/login");
        return;
      }

      // El id permite a la página de éxito saber cuándo se confirmó el correo.
      router.push(`/auth/sign-up-success?uid=${data.user?.id ?? ""}`);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUpTitle")}</CardTitle>
          <CardDescription>{t("signUpDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Daniela Alvarez"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="5512345678"
                  required
                  value={phone}
                  onChange={(e) => setPhone(onlyPhoneDigits(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">{t("repeatPassword")}</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("creatingAccount") : t("signUpTitle")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("haveAccount")}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t("login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const INTERVALO_CONFIRMACION_MS = 3000;

/**
 * En la página "Revisa tu correo": consulta cada pocos segundos si el usuario
 * ya confirmó su correo (aunque lo haga desde otro dispositivo) y, en cuanto
 * lo hace, lleva esta pestaña al inicio de sesión.
 */
export function SignUpSuccessRedirect() {
  const uid = useSearchParams().get("uid");
  const router = useRouter();

  useEffect(() => {
    if (!uid) return;
    const supabase = createClient();
    let activo = true;

    const revisar = async () => {
      const { data } = await supabase.rpc("correo_confirmado", { p_user_id: uid });
      if (activo && data === true) {
        activo = false;
        clearInterval(id);
        router.replace("/auth/login");
      }
    };

    const id = setInterval(revisar, INTERVALO_CONFIRMACION_MS);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [uid, router]);

  return null;
}

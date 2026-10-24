import { isAuthError } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clave de traducción (namespace `auth`) de cada código de error de Supabase Auth.
// Supabase responde siempre en inglés; el código es estable aunque cambie el texto.
const AUTH_ERROR_KEYS: Record<string, string> = {
  invalid_credentials: "errInvalidCredentials",
  email_not_confirmed: "errEmailNotConfirmed",
  user_already_exists: "errUserExists",
  email_exists: "errUserExists",
  weak_password: "errWeakPassword",
  same_password: "errSamePassword",
  email_address_invalid: "errEmailInvalid",
  over_email_send_rate_limit: "errTooManyEmails",
  over_request_rate_limit: "errTooManyRequests",
  session_not_found: "errSessionExpired",
  session_expired: "errSessionExpired",
};

/**
 * Clave del mensaje (en español/inglés) para un error de Supabase Auth.
 * Los errores desconocidos usan el mensaje genérico; el original queda en consola.
 */
export function authErrorKey(error: unknown): string {
  const key = isAuthError(error) && error.code ? AUTH_ERROR_KEYS[error.code] : undefined;
  if (!key) console.error("[auth] error:", error);
  return key ?? "errorGeneric";
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

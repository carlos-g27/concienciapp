"use server";

import { cookies } from "next/headers";
import { locales, defaultLocale, LOCALE_COOKIE, type Locale } from "@/i18n/request";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Guarda el idioma elegido en la cookie NEXT_LOCALE. El cliente hace
 * router.refresh() tras llamarla para re-renderizar con el nuevo idioma.
 */
export async function setLocale(locale: Locale): Promise<void> {
  const value: Locale = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;

  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

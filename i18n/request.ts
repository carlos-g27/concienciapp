import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Idiomas soportados. El español es el idioma por defecto.
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Configuración de next-intl por petición (modo cookie, sin routing por URL).
 * El idioma se lee de la cookie NEXT_LOCALE; si no existe o es inválido, se usa
 * el idioma por defecto (español).
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale =
    cookieLocale && (locales as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as Locale)
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

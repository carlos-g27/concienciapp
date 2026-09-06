"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Toggle de tema simple para la landing (claro ↔ oscuro).
 *
 * Es un botón plano, sin DropdownMenu de Radix: en la landing hay GSAP
 * ScrollSmoother + una sección con `pin`, y el scroll-lock/portal de Radix
 * hacía saltar la página a la galería y bloqueaba el scroll. Un botón simple
 * evita ese conflicto. El `ThemeSwitcher` compartido (con "system") sigue en
 * el resto de la app.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="inline-flex items-center justify-center p-1.5 rounded-lg transition-transform active:scale-95"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

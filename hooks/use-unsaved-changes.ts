"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

// Mensaje activo mientras alguna vista tiene cambios sin guardar. Lo usa
// `confirmLeave` en navegaciones programáticas (router.push / router.back).
let pendingMessage: string | null = null;

/**
 * Pide confirmación antes de una navegación programática si hay cambios sin
 * guardar. Devuelve true si se puede navegar.
 */
export function confirmLeave(): boolean {
  return pendingMessage === null || window.confirm(pendingMessage);
}

/**
 * Avisa "Tienes cambios sin guardar" mientras `isDirty` sea true:
 * - al cerrar o recargar la pestaña (diálogo nativo del navegador);
 * - al hacer clic en un link interno (menú, "Volver", etc.).
 * Las navegaciones con router.push/back deben pasar por `confirmLeave()`.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  const t = useTranslations("common");
  const message = t("unsavedChanges");

  useEffect(() => {
    if (!isDirty) return;
    pendingMessage = message;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Fase de captura en document: corre antes que el onClick de <Link>.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // sale del sitio: lo cubre beforeunload
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      pendingMessage = null;
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty, message]);
}

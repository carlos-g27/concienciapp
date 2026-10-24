"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirmDialog, type DialogOptions } from "@/components/ui/confirm-dialog";

// Aviso activo mientras alguna vista tiene cambios sin guardar. Lo usa
// `confirmLeave` en navegaciones programáticas (router.push / router.back).
let pendingDialog: DialogOptions | null = null;

/**
 * Pide confirmación (aviso de la app) antes de una navegación programática si
 * hay cambios sin guardar. Resuelve true si se puede navegar.
 */
export function confirmLeave(): Promise<boolean> {
  return pendingDialog === null ? Promise.resolve(true) : confirmDialog(pendingDialog);
}

/**
 * Avisa "Tienes cambios sin guardar" mientras `isDirty` sea true:
 * - al hacer clic en un link interno (menú, "Volver", etc.), con el aviso de la app;
 * - al cerrar o recargar la pestaña, con el diálogo del navegador (es el único
 *   que el navegador permite en ese caso).
 * Las navegaciones con router.push/back deben pasar por `confirmLeave()`.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();
  const t = useTranslations("common");
  const title = t("unsavedTitle");
  const description = t("unsavedChanges");
  const confirmLabel = t("leaveWithoutSaving");
  const cancelLabel = t("keepEditing");

  useEffect(() => {
    if (!isDirty) return;
    const dialog: DialogOptions = { title, description, confirmLabel, cancelLabel };
    pendingDialog = dialog;

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

      // Se detiene la navegación y se pregunta con el aviso de la app.
      e.preventDefault();
      e.stopPropagation();
      void confirmDialog(dialog).then((ok) => {
        if (ok) router.push(url.pathname + url.search + url.hash);
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      pendingDialog = null;
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty, title, description, confirmLabel, cancelLabel, router]);
}

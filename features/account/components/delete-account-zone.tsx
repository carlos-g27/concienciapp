"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteMyAccount } from "../actions";

const COUNTDOWN_SECONDS = 5;

const ITEM_KEYS = ["itemProfile", "itemPhoto", "itemPlans", "itemWeights", "itemWins"] as const;

/**
 * Zona de peligro (roja) con el botón "Eliminar cuenta". Abre un aviso de la
 * app cuyo botón de confirmar se habilita tras una cuenta regresiva de 5 s,
 * para evitar eliminaciones accidentales. Se usa en la configuración del
 * usuario y en la del admin.
 */
export default function DeleteAccountZone() {
  const t = useTranslations("deleteAccount");
  const [isOpen, setIsOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    setSecondsLeft(COUNTDOWN_SECONDS);
    setError(null);
    setIsOpen(true);
  };

  const close = () => {
    if (!isDeleting) setIsOpen(false);
  };

  // Cuenta regresiva mientras el aviso está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Foco en "Cancelar" (la opción segura) y Escape para cerrar.
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isDeleting]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    // Si sale bien, la acción redirige al login y no vuelve aquí.
    const res = await deleteMyAccount();
    if (!res.success) {
      setError(res.error ?? t("errGeneric"));
      setIsDeleting(false);
    }
  };

  const canConfirm = secondsLeft === 0 && !isDeleting;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider ml-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {t("zoneTitle")}
      </h2>

      <Card className="border-red-600/40 bg-red-600/5">
        <CardContent className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[0.9rem] font-bold text-foreground">{t("title")}</h3>
            <p className="text-[0.8rem] text-muted-foreground mt-1">{t("description")}</p>
          </div>
          <Button variant="destructive" onClick={open} className="shrink-0">
            {t("button")}
          </Button>
        </CardContent>
      </Card>

      {/* Aviso de confirmación */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-red-600/40 bg-card p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <h2 id="delete-account-title" className="text-lg font-bold text-foreground">
                  {t("modalTitle")}
                </h2>
                <p id="delete-account-desc" className="text-sm text-muted-foreground mt-1">
                  {t("modalBody")}
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 text-sm text-foreground pl-1">
              {ITEM_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" aria-hidden />
                  {t(key)}
                </li>
              ))}
            </ul>

            <p className="text-sm font-semibold text-red-600">{t("irreversible")}</p>

            {error && (
              <p role="alert" className="px-3 py-2 rounded-[10px] bg-red-600/10 text-red-600 dark:text-red-400 text-[0.85rem] font-medium">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button ref={cancelRef} variant="outline" onClick={close} disabled={isDeleting}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
                {isDeleting
                  ? t("deleting")
                  : secondsLeft > 0
                    ? t("confirmIn", { n: secondsLeft })
                    : t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

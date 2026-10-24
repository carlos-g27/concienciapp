"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BrandLoader from "@/components/ui/brand-loader";
import { confirmLeave, useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";

interface AdminFormLayoutProps {
  title: string;
  subtitle: string;
  isLoading?: boolean;
  isSaving?: boolean;
  loadingText?: string;
  submitText?: string;
  savingText?: string;
  error?: string | null;
  /** Aviso verde de éxito (ej. "Ejercicio creado exitosamente"). */
  successMsg?: string | null;
  /** Hay cambios sin guardar: avisa antes de salir. */
  isDirty?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export default function AdminFormLayout({
  title,
  subtitle,
  isLoading = false,
  isSaving = false,
  loadingText,
  submitText,
  savingText,
  error,
  successMsg,
  isDirty = false,
  onSubmit,
  children,
}: AdminFormLayoutProps) {
  const router = useRouter();
  const t = useTranslations("adminCommon");
  useUnsavedChangesWarning(isDirty);

  return (
    <div className="max-w-[680px] mx-auto flex flex-col gap-5 w-full">
      {/* Botón Volver */}
      <button
        onClick={() => void confirmLeave().then((ok) => ok && router.back())}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer bg-transparent border-none p-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("back")}
      </button>

      {/* Cabecera */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-[0.85rem] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Contenedor principal */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <BrandLoader size="sm" label={loadingText} />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              
              {/* Aquí se inyectan los campos específicos (receta o ejercicio) */}
              {children}

              {/* Aviso de éxito (mismo estilo verde que el resto de la app) */}
              {successMsg && (
                <p role="status" className="px-4 py-3 rounded-[10px] bg-green-600/10 text-green-600 text-[0.85rem] font-medium">
                  {successMsg}
                </p>
              )}

              {/* Manejo de errores global del formulario */}
              {error && (
                <p role="alert" className="px-4 py-3 rounded-[10px] bg-red-600/10 text-red-600 dark:text-red-400 text-[0.85rem] font-medium">
                  {error}
                </p>
              )}

              {/* Botón de envío estándar */}
              <Button type="submit" disabled={isSaving} className="w-full mt-2">
                {isSaving ? (savingText ?? t("saving")) : (submitText ?? t("save"))}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
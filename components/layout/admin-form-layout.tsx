"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminFormLayoutProps {
  title: string;
  subtitle: string;
  isLoading?: boolean;
  isSaving?: boolean;
  loadingText?: string;
  submitText?: string;
  savingText?: string;
  error?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export default function AdminFormLayout({
  title,
  subtitle,
  isLoading = false,
  isSaving = false,
  loadingText = "Cargando...",
  submitText = "Guardar",
  savingText = "Guardando...",
  error,
  onSubmit,
  children,
}: AdminFormLayoutProps) {
  const router = useRouter();

  return (
    <div className="max-w-[680px] mx-auto flex flex-col gap-5 w-full">
      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer bg-transparent border-none p-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
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
            <p className="text-center py-8 text-muted-foreground text-sm">
              {loadingText}
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              
              {/* Aquí se inyectan los campos específicos (receta o ejercicio) */}
              {children}

              {/* Manejo de errores global del formulario */}
              {error && (
                <p className="text-[0.85rem] text-destructive font-medium">
                  {error}
                </p>
              )}

              {/* Botón de envío estándar */}
              <Button type="submit" disabled={isSaving} className="w-full mt-2">
                {isSaving ? savingText : submitText}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
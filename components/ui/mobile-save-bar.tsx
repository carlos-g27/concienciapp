"use client";

import { Button } from "@/components/ui/button";

interface MobileSaveBarProps {
  onSave: () => void;
  disabled: boolean;
  isSaving: boolean;
  label: string;
  savingLabel: string;
  successMsg?: string | null;
  error?: string | null;
  /** Botón secundario a la izquierda (ej. "Cancelar"). */
  secondary?: { label: string; onClick: () => void; disabled?: boolean };
}

/**
 * Barra fija de "Guardar cambios" para móvil/tablet, justo encima de la barra
 * de navegación inferior (al alcance del pulgar). Incluye el aviso de
 * éxito/error para que se vea aunque el usuario esté abajo en la página.
 * En escritorio (lg) no se muestra: ahí el botón va en la cabecera.
 */
export default function MobileSaveBar({
  onSave,
  disabled,
  isSaving,
  label,
  savingLabel,
  successMsg,
  error,
  secondary,
}: MobileSaveBarProps) {
  return (
    <>
      {/* Espacio para que la barra no tape el final del contenido */}
      <div aria-hidden className="h-20 lg:hidden" />

      <div
        className="fixed inset-x-0 z-20 lg:hidden border-t border-border bg-card/90 backdrop-blur-md px-4 py-3 flex flex-col gap-2"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        {successMsg && (
          <p role="status" className="text-[0.8rem] font-medium text-green-600 text-center">{successMsg}</p>
        )}
        {error && (
          <p role="alert" className="text-[0.8rem] font-medium text-destructive text-center">{error}</p>
        )}
        <div className="flex gap-3">
          {secondary && (
            <Button
              variant="outline"
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className="flex-1 h-11"
            >
              {secondary.label}
            </Button>
          )}
          <Button onClick={onSave} disabled={disabled} className={`h-11 ${secondary ? "flex-[2]" : "w-full"}`}>
            {isSaving ? savingLabel : label}
          </Button>
        </div>
      </div>
    </>
  );
}

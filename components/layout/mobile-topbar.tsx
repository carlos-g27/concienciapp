import type { ReactNode } from "react";

interface MobileTopbarProps {
  /** Sección actual (ej. "Mi Nutrición", "Catálogo de recetas"). */
  title: string;
  /** Línea pequeña sobre el título (ej. "Hola, Clarent" en el inicio). */
  greeting?: string;
  /** Contenido a la derecha (menú de cuenta). */
  children: ReactNode;
}

/** Topbar de móvil del usuario y del admin: no anclado, solo < lg. */
export default function MobileTopbar({ title, greeting, children }: MobileTopbarProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 lg:hidden">
      <div className="flex flex-col min-w-0">
        {greeting && (
          <span className="text-xs font-medium text-muted-foreground truncate">{greeting}</span>
        )}
        <p className="text-xl font-bold text-foreground tracking-tight truncate">{title}</p>
      </div>
      {children}
    </header>
  );
}

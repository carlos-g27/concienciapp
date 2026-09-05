import NotFoundView from "@/features/errors/components/not-found-view";

/**
 * Página 404 global: Next la renderiza para cualquier ruta inexistente.
 * Wrapper fino que delega en la vista de error de la funcionalidad "errors".
 */
export default function NotFound() {
  return <NotFoundView />;
}

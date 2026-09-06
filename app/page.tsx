import LandingPage from "@/components/landing/landing-page";

/**
 * Página pública (landing). El proxy redirige a los usuarios autenticados a su
 * dashboard/admin, así que aquí solo llegan visitantes sin sesión.
 */
export default function Home() {
  return <LandingPage />;
}

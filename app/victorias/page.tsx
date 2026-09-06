import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireUser } from "@/lib/auth/require-user";
import { getDailyWins } from "@/features/daily-wins/queries";
import VictoriasManager from "@/features/daily-wins/components/victorias-manager";

export default function VictoriasPage() {
  // El acceso dinámico (sesión) va dentro de un <Suspense> en la propia página:
  // es lo que cacheComponents exige para no bloquear el prerender.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <VictoriasContent />
    </Suspense>
  );
}

async function VictoriasContent() {
  const user = await requireUser();
  const wins = await getDailyWins(user.id);

  return <VictoriasManager initialWins={wins} />;
}

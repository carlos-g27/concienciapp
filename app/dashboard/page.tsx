import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/features/dashboard/queries";
import DashboardView from "@/features/dashboard/components/dashboard-view";

export default function DashboardPage() {
  // El acceso dinámico (sesión) va dentro de un <Suspense> en la propia página:
  // es lo que cacheComponents exige para no bloquear el prerender.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return <DashboardView data={data} />;
}

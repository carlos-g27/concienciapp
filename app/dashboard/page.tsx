import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/features/dashboard/queries";
import DashboardView from "@/features/dashboard/components/dashboard-view";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return <DashboardView data={data} />;
}

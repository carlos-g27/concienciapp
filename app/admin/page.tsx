import { Suspense } from "react";
import AdminDashboard from "../../components/admin-component/dashboard/admin-dashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
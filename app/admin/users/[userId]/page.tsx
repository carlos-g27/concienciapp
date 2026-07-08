import AdminUserProfile from "@/components/admin-component/admin-user/admin-user-profile";
import { Suspense } from "react";

export default function AdminUserProfilePage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando...</div>}>
        <AdminUserProfile />
      </Suspense>
    )
}
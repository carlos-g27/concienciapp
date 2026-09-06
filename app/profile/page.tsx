import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/features/profile/queries";
import ProfileForm from "@/features/profile/components/profile-form";

export default function ProfilePage() {
  // El acceso dinámico (sesión/perfil) va dentro de un <Suspense> en la propia
  // página: es lo que cacheComponents exige para no bloquear el prerender.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return <ProfileForm initialProfile={profile} />;
}

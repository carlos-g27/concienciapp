import { Suspense } from "react";
import { ProfileProvider } from "@/hooks/use-profile";
import { PilarSettingsProvider } from "@/hooks/use-pilar-settings";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <ProfileProvider>
        <PilarSettingsProvider>
          {children}
        </PilarSettingsProvider>
      </ProfileProvider>
    </Suspense>
  );
}

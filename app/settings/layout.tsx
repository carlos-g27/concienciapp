import { Suspense } from "react";
import UserShell from "@/features/shell/user-shell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <UserShell>{children}</UserShell>
    </Suspense>
  );
}

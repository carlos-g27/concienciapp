import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import UserShell from "@/features/shell/user-shell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <UserShell>{children}</UserShell>
    </Suspense>
  );
}

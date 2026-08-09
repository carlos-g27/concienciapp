import { ProfileProvider } from "@/hooks/use-profile";
import { PilarSettingsProvider } from "@/hooks/use-pilar-settings";

export default function PilarNutricionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <PilarSettingsProvider>
        {children}
      </PilarSettingsProvider>
    </ProfileProvider>
  );
}

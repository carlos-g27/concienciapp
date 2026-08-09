import { ProfileProvider } from "@/hooks/use-profile";
import { PilarSettingsProvider } from "@/hooks/use-pilar-settings";

export default function SettingsLayout({
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

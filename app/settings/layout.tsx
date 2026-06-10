import { ProfileProvider } from "@/hooks/use-profile";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

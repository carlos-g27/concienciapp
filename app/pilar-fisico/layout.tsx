import { ProfileProvider } from "@/hooks/use-profile";

export default function PilarFisicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

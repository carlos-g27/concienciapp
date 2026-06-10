import { ProfileProvider } from "@/hooks/use-profile";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

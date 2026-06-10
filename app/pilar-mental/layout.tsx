import { ProfileProvider } from "@/hooks/use-profile";

export default function PilarMentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

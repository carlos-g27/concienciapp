import { ProfileProvider } from "@/hooks/use-profile";

export default function PilarNutricionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

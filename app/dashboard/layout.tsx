import { ProfileProvider } from "@/hooks/use-profile";
 
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileProvider>{children}</ProfileProvider>;
}
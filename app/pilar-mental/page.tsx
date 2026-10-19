import { Suspense } from "react";
import BrandLoader from "@/components/ui/brand-loader";
import { requireUser } from "@/lib/auth/require-user";
import { getUserMeditations } from "@/features/mental/queries";
import { getPilarSettings } from "@/features/shell/queries";
import MentalView from "@/features/mental/components/mental-view";
import PilarMaintenance from "@/components/ui/pilar-maintenance";

export default function PilarMentalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrandLoader /></div>}>
      <MentalContent />
    </Suspense>
  );
}

async function MentalContent() {
  const user = await requireUser();
  const pilares = await getPilarSettings();

  if (!pilares.mental) {
    return <PilarMaintenance pilarName="Pilar Mental" />;
  }

  const meditations = await getUserMeditations(user.id);

  return <MentalView initialMeditations={meditations} />;
}

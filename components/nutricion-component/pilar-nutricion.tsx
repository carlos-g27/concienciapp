"use client";

import SidebarLayout from "../../components/dashboard-logic/sidebar-config";
import Card from "@/components/ui/new-card";

export default function Nutricion() {
  return (
    <SidebarLayout pageTitle="Nutrición">
      <>
        <Card onClick={() => alert("¡Aquí iría la funcionalidad de seguimiento nutricional!")}>
          <h3>Seguimiento Nutricional</h3>
          <p>Registra tus comidas, calorías y macros para mantener tu dieta bajo control.</p>
        </Card>
      </>
    </SidebarLayout>
  );
}
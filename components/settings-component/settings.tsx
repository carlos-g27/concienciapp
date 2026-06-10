"use client";

import SidebarLayout from "../../components/dashboard-logic/sidebar-config";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Settings() {
  return (
    <SidebarLayout pageTitle="Configuración">
        <ThemeSwitcher />
    </SidebarLayout>
  );
}
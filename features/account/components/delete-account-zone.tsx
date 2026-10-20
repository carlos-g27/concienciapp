"use client";

import DangerDeleteZone from "@/components/ui/danger-delete-zone";
import { deleteMyAccount } from "../actions";

/** Zona de peligro para eliminar la propia cuenta (usuario y admin). */
export default function DeleteAccountZone() {
  return <DangerDeleteZone namespace="deleteAccount" onConfirm={() => deleteMyAccount()} />;
}

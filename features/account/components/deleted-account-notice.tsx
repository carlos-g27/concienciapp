"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

/** Aviso en el login tras eliminar la cuenta (`?deleted=1`). */
export default function DeletedAccountNotice() {
  const searchParams = useSearchParams();
  const t = useTranslations("deleteAccount");

  if (searchParams.get("deleted") !== "1") return null;

  return (
    <div role="status" className="mb-4 px-4 py-3 rounded-[10px] bg-green-600/10 text-green-600 text-[0.85rem] font-medium">
      {t("deletedNotice")}
    </div>
  );
}

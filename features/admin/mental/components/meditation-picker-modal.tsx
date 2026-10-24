"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { alertDialog, confirmDialog } from "@/components/ui/confirm-dialog";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";
import { confirmLeave } from "@/hooks/use-unsaved-changes";
import { deleteMeditation } from "@/features/admin/meditations/actions";
import type { MeditationCategory } from "@/features/admin/meditations/types";
import type { CatalogMeditation } from "../types";

interface MeditationPickerModalProps {
  catalog: CatalogMeditation[];
  category: MeditationCategory;
  excludeIds: string[];
  onSelect: (meditation: CatalogMeditation) => void;
  onClose: () => void;
}

const MOON_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  </svg>
);

export default function MeditationPickerModal({
  catalog,
  category,
  excludeIds,
  onSelect,
  onClose,
}: MeditationPickerModalProps) {
  const router = useRouter();
  const t = useTranslations("adminAssign");
  const tCommon = useTranslations("common");
  const tc = useTranslations("adminCatalog");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Meditaciones de esta categoría sin asignar aún (si es 0, ya se asignaron todas).
  const available = catalog.filter((m) => m.category === category).filter((m) => !excludeIds.includes(m.id));
  const filtered = available.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const pickerItems: (PickerItem & { original: CatalogMeditation })[] = filtered.map((meditation) => ({
    id: meditation.id,
    title: meditation.name,
    subtitle: meditation.duration != null ? tc("medMinutes", { n: meditation.duration }) : undefined,
    icon: MOON_ICON,
    original: meditation,
  }));

  const handleEdit = (meditationId: string) => {
    void confirmLeave().then((ok) => ok && router.push(`/admin/meditations?id=${meditationId}`));
  };

  const handleDelete = async (item: PickerItem & { original: CatalogMeditation }) => {
    const meditation = item.original;
    const confirmed = await confirmDialog({
      tone: "danger",
      title: tCommon("deleteTitle"),
      description: t("pickerDeleteConfirmMed", { name: meditation.name }),
      confirmLabel: tCommon("delete"),
    });
    if (!confirmed) return;

    setDeletingId(meditation.id);
    const res = await deleteMeditation(meditation.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando meditación:", res.error);
      void alertDialog({ title: t("pickerDeleteErrorMed") });
    }
    setDeletingId(null);
  };

  return (
    <PickerModal
      title={t("pickerAddMeditation")}
      searchPlaceholder={t("pickerSearchMeditation")}
      search={search}
      onSearchChange={setSearch}
      items={pickerItems}
      isLoading={false}
      emptyMessage={
        catalog.filter((m) => m.category === category).length === 0
          ? t("pickerEmptyNoneMed")
          : available.length === 0
            ? t("pickerEmptyAllAssignedMed")
            : t("pickerEmptyNoResultsMed")
      }
      deletingId={deletingId}
      onSelect={(item) => onSelect(item.original)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={onClose}
      footerPrompt={t("pickerFooterMed")}
      createLinkHref={`/admin/meditations?category=${category}`}
      createLinkLabel={t("pickerCreateMed")}
    />
  );
}

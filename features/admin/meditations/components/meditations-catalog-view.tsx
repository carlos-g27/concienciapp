"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { alertDialog, confirmDialog } from "@/components/ui/confirm-dialog";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { deleteMeditation } from "../actions";
import { MEDITATION_CATEGORY_LABEL_KEYS, isMeditationCategory, type Meditation } from "../types";

interface MeditationsCatalogViewProps {
  initialItems: Meditation[];
}

export default function MeditationsCatalogView({ initialItems }: MeditationsCatalogViewProps) {
  const router = useRouter();
  const t = useTranslations("adminCatalog");
  const tc = useTranslations("common");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((m) => ({
    id: m.id,
    title: m.name,
    subtitle: [
      isMeditationCategory(m.category) ? t(MEDITATION_CATEGORY_LABEL_KEYS[m.category]) : m.category,
      m.duration != null ? t("medMinutes", { n: m.duration }) : null]
      .filter(Boolean)
      .join(" • "),
  }));

  const filtered = items.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/meditations?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = await confirmDialog({
      tone: "danger",
      title: tc("deleteTitle"),
      description: t("medDeleteConfirm", { title: item.title }),
      confirmLabel: tc("delete"),
    });
    if (!confirmed) return;

    setDeletingId(item.id);
    const res = await deleteMeditation(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando meditación:", res.error);
      void alertDialog({ title: t("medDeleteError") });
    }
    setDeletingId(null);
  };

  return (
    <CatalogList
      title={t("medTitle")}
      subtitle={t("medSubtitle")}
      searchPlaceholder={t("medSearch")}
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={false}
      emptyMessage={
        initialItems.length === 0 ? t("medEmptyNone") : t("medEmptyNoResults")
      }
      deletingId={deletingId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createLinkHref="/admin/meditations"
      createLinkLabel={t("medNew")}
    />
  );
}

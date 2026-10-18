"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { getYoutubeThumbnail } from "@/lib/youtube";
import { deleteMeditation } from "../actions";
import type { Meditation } from "../types";

interface MeditationsCatalogViewProps {
  initialItems: Meditation[];
}

export default function MeditationsCatalogView({ initialItems }: MeditationsCatalogViewProps) {
  const router = useRouter();
  const t = useTranslations("adminCatalog");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((m) => ({
    id: m.id,
    title: m.name,
    subtitle: [m.category, m.duration != null ? t("medMinutes", { n: m.duration }) : null]
      .filter(Boolean)
      .join(" • "),
    imageUrl: getYoutubeThumbnail(m.video_url),
  }));

  const filtered = items.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/meditations?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = window.confirm(t("medDeleteConfirm", { title: item.title }));
    if (!confirmed) return;

    setDeletingId(item.id);
    const res = await deleteMeditation(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando meditación:", res.error);
      alert(t("medDeleteError"));
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { alertDialog, confirmDialog } from "@/components/ui/confirm-dialog";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { deleteExercise } from "../actions";
import type { ExerciseCatalogItem } from "../types";

interface ExercisesCatalogViewProps {
  initialItems: ExerciseCatalogItem[];
}

export default function ExercisesCatalogView({ initialItems }: ExercisesCatalogViewProps) {
  const router = useRouter();
  const t = useTranslations("adminCatalog");
  const tc = useTranslations("common");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((e) => ({
    id: e.id,
    title: e.name,
    subtitle: e.muscle,
  }));

  const filtered = items.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/exercises?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = await confirmDialog({
      tone: "danger",
      title: tc("deleteTitle"),
      description: t("exDeleteConfirm", { title: item.title }),
      confirmLabel: tc("delete"),
    });
    if (!confirmed) return;

    setDeletingId(item.id);
    const res = await deleteExercise(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando ejercicio:", res.error);
      void alertDialog({ title: t("exDeleteError") });
    }
    setDeletingId(null);
  };

  return (
    <CatalogList
      title={t("exTitle")}
      subtitle={t("exSubtitle")}
      searchPlaceholder={t("exSearch")}
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={false}
      emptyMessage={
        initialItems.length === 0 ? t("exEmptyNone") : t("exEmptyNoResults")
      }
      deletingId={deletingId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createLinkHref="/admin/exercises"
      createLinkLabel={t("exNew")}
    />
  );
}

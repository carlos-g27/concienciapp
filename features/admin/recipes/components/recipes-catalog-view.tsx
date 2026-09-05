"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import CatalogList, { CatalogItem } from "@/components/ui/catalog-list";
import { deleteRecipe } from "../actions";
import type { RecipeCatalogItem } from "../types";

interface RecipesCatalogViewProps {
  initialItems: RecipeCatalogItem[];
}

export default function RecipesCatalogView({ initialItems }: RecipesCatalogViewProps) {
  const router = useRouter();
  const t = useTranslations("adminCatalog");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items: CatalogItem[] = initialItems.map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: `${r.calories} kcal`,
    imageUrl: r.image_url,
  }));

  const filtered = items.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/recipes?id=${id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = window.confirm(t("recDeleteConfirm", { title: item.title }));
    if (!confirmed) return;

    setDeletingId(item.id);
    const res = await deleteRecipe(item.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando receta:", res.error);
      alert(t("recDeleteError"));
    }
    setDeletingId(null);
  };

  return (
    <CatalogList
      title={t("recTitle")}
      subtitle={t("recSubtitle")}
      searchPlaceholder={t("recSearch")}
      search={search}
      onSearchChange={setSearch}
      items={filtered}
      isLoading={false}
      emptyMessage={
        initialItems.length === 0 ? t("recEmptyNone") : t("recEmptyNoResults")
      }
      deletingId={deletingId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createLinkHref="/admin/recipes"
      createLinkLabel={t("recNew")}
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";
import { deleteRecipe } from "@/features/admin/recipes/actions";
import type { CatalogRecipe, MealType } from "../types";

interface RecipePickerModalProps {
  catalog: CatalogRecipe[];
  mealType: MealType;
  excludeIds: string[];
  onSelect: (recipe: CatalogRecipe) => void;
  onClose: () => void;
}

export default function RecipePickerModal({
  catalog,
  mealType,
  excludeIds,
  onSelect,
  onClose,
}: RecipePickerModalProps) {
  const router = useRouter();
  const t = useTranslations("adminAssign");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = catalog
    .filter((r) => r.meal_type === mealType)
    .filter((r) => !excludeIds.includes(r.id))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const pickerItems: (PickerItem & { original: CatalogRecipe })[] = filtered.map((recipe) => ({
    id: recipe.id,
    title: recipe.name,
    subtitle: `${recipe.calories} kcal`,
    imageUrl: recipe.image_url,
    original: recipe,
  }));

  const handleEdit = (recipeId: string) => {
    router.push(`/admin/recipes?id=${recipeId}`);
  };

  const handleDelete = async (item: PickerItem & { original: CatalogRecipe }) => {
    const recipe = item.original;
    const confirmed = window.confirm(t("pickerDeleteConfirmRec", { name: recipe.name }));
    if (!confirmed) return;

    setDeletingId(recipe.id);
    const res = await deleteRecipe(recipe.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando receta:", res.error);
      alert(t("pickerDeleteErrorRec"));
    }
    setDeletingId(null);
  };

  return (
    <PickerModal
      title={t("pickerAddRecipe")}
      searchPlaceholder={t("pickerSearchRecipe")}
      search={search}
      onSearchChange={setSearch}
      items={pickerItems}
      isLoading={false}
      emptyMessage={
        catalog.filter((r) => r.meal_type === mealType).length === 0
          ? t("pickerEmptyNoneRec")
          : t("pickerEmptyNoResultsRec")
      }
      deletingId={deletingId}
      onSelect={(item) => onSelect(item.original)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={onClose}
      footerPrompt={t("pickerFooterRec")}
      createLinkHref={`/admin/recipes?type=${mealType}`}
      createLinkLabel={t("pickerCreateRec")}
    />
  );
}

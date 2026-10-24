"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { alertDialog, confirmDialog } from "@/components/ui/confirm-dialog";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";
import { confirmLeave } from "@/hooks/use-unsaved-changes";
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
  const tc = useTranslations("common");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Recetas de esta comida sin asignar aún (si es 0, ya se asignaron todas).
  const available = catalog.filter((r) => r.meal_type === mealType).filter((r) => !excludeIds.includes(r.id));
  const filtered = available.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const pickerItems: (PickerItem & { original: CatalogRecipe })[] = filtered.map((recipe) => ({
    id: recipe.id,
    title: recipe.name,
    subtitle: `${recipe.calories} kcal`,
    imageUrl: recipe.image_url,
    original: recipe,
  }));

  const handleEdit = (recipeId: string) => {
    void confirmLeave().then((ok) => ok && router.push(`/admin/recipes?id=${recipeId}`));
  };

  const handleDelete = async (item: PickerItem & { original: CatalogRecipe }) => {
    const recipe = item.original;
    const confirmed = await confirmDialog({
      tone: "danger",
      title: tc("deleteTitle"),
      description: t("pickerDeleteConfirmRec", { name: recipe.name }),
      confirmLabel: tc("delete"),
    });
    if (!confirmed) return;

    setDeletingId(recipe.id);
    const res = await deleteRecipe(recipe.id);
    if (res.success) {
      router.refresh();
    } else {
      console.error("Error eliminando receta:", res.error);
      void alertDialog({ title: t("pickerDeleteErrorRec") });
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
          : available.length === 0
            ? t("pickerEmptyAllAssignedRec")
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

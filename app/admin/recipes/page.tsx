import AdminCreateRecipe from "@/components/admin-component/admin-meals/admin-create-recipe";
import { Suspense } from "react";

export default function AdminCreateRecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminCreateRecipe />
    </Suspense>
  )
}
"use client";

import { EditAccountSheeet } from "@/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditCategorySheeet } from "@/features/categories/components/edit-category-sheet";
import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";
import { useMountedState } from "react-use";

export const SheetProvider = () => {
  // equivalent of using useState and useEffect to check if component has mounted
  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheeet />
      <NewCategorySheet />
      <EditCategorySheeet />
    </>
  );
};

"use client";

import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";

import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const categoryQuery = useGetCategories();
  const categories = categoryQuery.data || []; // query for any existing accounts
  const newCategory = useNewCategory(); // hook to use the drawer sheet for creating account
  const bulkDelete = useBulkDeleteCategories(); // to bulk delete rows from table

  // disabled delete btn if account query or delete is on going
  const isDisabled = categoryQuery.isLoading || bulkDelete.isPending;

  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Categories</CardTitle>
          <Button onClick={newCategory.onOpen}>
            <Plus />
            Add new
          </Button>
        </CardHeader>
        {categoryQuery.isLoading ? (
          <CardContent className="mt-4">
            <Skeleton className="h-10 max-w-sm" />
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
        ) : (
          <CardContent>
            <DataTable
              columns={columns}
              data={categories}
              filterKey="name"
              onDelete={(rows) => {
                // map through the array of user selected rows and get only their ids
                const ids = rows.map((r) => r.original.id); // .orignal contains the actual row data

                bulkDelete.mutate({ ids }); // call bulk delete fn and pass the array of ids
              }}
              disabled={isDisabled}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

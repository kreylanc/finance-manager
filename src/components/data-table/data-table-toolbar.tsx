"use client";

import { Row, type Table } from "@tanstack/react-table";
import { SlidersHorizontal, Trash2, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Button } from "../ui/button";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useConfirm } from "/hooks/use-confirm";
import { ExportDropdown } from "../export-dropdown";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  filterKey,
  onDelete,
  disabled,
}: DataTableToolbarProps<TData>) {
  const { data: categories } = useGetCategories();

  const isFiltered = table.getState().columnFilters.length > 0;
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete permanently",
  );

  return (
    <>
      <ConfirmDialog />
      <div className="flex flex-col md:flex-row gap-2 justify-between md:items-center py-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder={`Filter ${filterKey}...`}
            value={
              (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterKey)?.setFilterValue(event.target.value)
            }
            className="w-full h-8 md:max-w-sm"
          />
          {table.getColumn("categories") && categories && (
            <DataTableFacetedFilter
              options={categories}
              column={table.getColumn("categories")}
              title="Category"
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => table.resetColumnFilters()}
            >
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex justify-between md:justify-end items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full h-8">
                <SlidersHorizontal />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportDropdown table={table} />
          {/* Delete button shown only when rows are selected */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              className=" text-xs border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={async () => {
                const ok = await confirm();
                if (ok) {
                  const selectedRows = table.getFilteredSelectedRowModel().rows;
                  onDelete(selectedRows); // pass the selected rows to delete function
                  table.resetRowSelection();
                }
              }}
            >
              <Trash2 className="size-8" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { useConfirm } from "/hooks/use-confirm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  categories?: {
    id: string;
    name: string;
  }[];
  onCategoryChange: (value: string) => void;
  selectedCategory: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  categories,
  onCategoryChange,
  selectedCategory,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete permanently",
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      <ConfirmDialog />
      <div className="flex flex-col md:flex-row gap-2 justify-between md:items-center py-4">
        <Input
          placeholder={`Filter ${filterKey}...`}
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterKey)?.setFilterValue(event.target.value)
          }
          className="w-full md:max-w-sm"
        />
        <div className="flex justify-end items-center gap-x-4">
          <Select
            defaultValue="all"
            value={selectedCategory}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem value={category.id} key={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center space-x-2 mt-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="-mr-2" />
          Previous
          <span className="sr-only">Go to previous page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="-ml-2" />
        </Button>
      </div>
    </div>
  );
}

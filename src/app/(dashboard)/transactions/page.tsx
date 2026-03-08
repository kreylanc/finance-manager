"use client";

import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";

import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const transactionQuery = useGetTransactions();
  const transactions = transactionQuery.data || []; // query for any existing transactions
  const newTransaction = useNewTransaction(); // hook to use the drawer sheet for creating transaction
  const bulkDeleteTransactions = useBulkDeleteTransactions(); // to bulk delete rows from table

  // disabled delete btn if transaction query or delete is on going
  const isDisabled =
    transactionQuery.isLoading || bulkDeleteTransactions.isPending;

  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transaction History
          </CardTitle>
          <Button onClick={newTransaction.onOpen}>
            <Plus />
            Add new
          </Button>
        </CardHeader>
        {transactionQuery.isLoading ? (
          <CardContent className="mt-4">
            <Skeleton className="h-10 max-w-sm" />
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
        ) : (
          <CardContent>
            <DataTable
              columns={columns}
              data={transactions}
              filterKey="payee"
              onDelete={(rows) => {
                // map through the array of user selected rows and get only their ids
                const ids = rows.map((r) => r.original.id); // .orignal contains the actual row data

                bulkDeleteTransactions.mutate({ ids }); // call bulk delete fn and pass the array of ids
              }}
              disabled={isDisabled}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

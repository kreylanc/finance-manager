"use client";

import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { transactions as transactionSchema } from "/db/schema";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useSelectCategory } from "@/features/categories/hooks/use-select-category";
import { ImportCard } from "@/app/(dashboard)/transactions/import-card";
import { UploadButton } from "@/app/(dashboard)/transactions/upload-button";
import { columns } from "@/app/(dashboard)/transactions/columns";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

export const TransactionClient = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const transactionQuery = useGetTransactions();
  const transactions = transactionQuery.data || []; // query for any existing transactions
  const newTransaction = useNewTransaction(); // hook to use the drawer sheet for creating transaction
  const bulkDeleteTransactions = useBulkDeleteTransactions(); // to bulk delete rows from table
  const bulkCreateTransactions = useBulkCreateTransactions(); // to bulk create transactions from csv import
  const [AccountDialog, confirmAccount] = useSelectAccount();
  const [CategoryDialog, confirmCategory] = useSelectCategory();

  // disabled delete btn if transaction query or delete is on going
  const isDisabled =
    transactionQuery.isLoading || bulkDeleteTransactions.isPending;

  // handle csv file upload
  const onUpload = (result: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(result);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  // handle csv import
  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[],
  ) => {
    // open account selection dialog and wait for user to select an account
    const accountId = await confirmAccount();
    if (!accountId) {
      return toast.error("Please select an account to continue.");
    }

    const categoryId = await confirmCategory();

    if (!categoryId) {
      return toast.error("Please select an account to continue.");
    }

    const data = values.map((item) => ({
      ...item,
      accountId: accountId as string,
      categoryId: categoryId ? (categoryId as string) : undefined,
    }));

    bulkCreateTransactions.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <CategoryDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }
  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transaction History
          </CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Button
              onClick={newTransaction.onOpen}
              size="sm"
              className="w-full"
            >
              <Plus />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        {transactionQuery.isLoading ? (
          <CardContent className="mt-4">
            <div className="flex flex-col md:flex-row gap-2">
              <Skeleton className="h-8 w-full md:max-w-52" />
              <Skeleton className="h-8 w-full md:w-28" />

              <Skeleton className="ml-auto h-8 w-full md:w-28" />
            </div>
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
        ) : (
          <CardContent>
            <DataTable
              columns={columns}
              data={transactions}
              filterKey="name"
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
};

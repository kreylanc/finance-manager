import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

import { TransactionClient } from "@/features/transactions/components/transaction-client";

export default function Transactions() {
  function TransactionsSkeleton() {
    return (
      <div className="max-w-screen-2xl w-full mx-auto -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-10 max-w-sm" />
          </CardHeader>
          <CardContent className="mt-4">
            <Skeleton className="h-10 max-w-sm" />
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionClient />
    </Suspense>
  );
}

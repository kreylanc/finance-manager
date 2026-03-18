import { columns } from "@/features/summary/columns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RecentTable } from "@/features/summary/components/recent-table";
import { Skeleton } from "./ui/skeleton";

type Props = {
  data?: {
    id: string;
    amount: number;
    name: string;
    date: string;
    dateBS: string;
    categories: string;
    account: string;
  }[];
};
export const RecentTransactions = ({ data = [] }: Props) => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:items-center justify-between lg:flex-row">
        <CardTitle className="text-xl line-clamp-1">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <RecentTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
};

export const RecentTransactionsLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:items-center justify-between lg:flex-row">
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="mt-4">
        <Skeleton className="h-60 w-full mt-4" />
      </CardContent>
    </Card>
  );
};

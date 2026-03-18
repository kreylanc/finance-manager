import { client } from "@/lib/hono";
import { convertAmountFromMilliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetSummary = () => {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["summary", { from, to, accountId }], // pass a query key
    queryFn: async () => {
      // handle query function
      // get data from s table
      const response = await client.api.summary.$get({
        query: {
          // pass required params to query
          from,
          to,
          accountId,
        },
      });
      // throw error if fetch failed for TanStack query to handle error
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();
      return {
        ...data,
        remainingAmount: convertAmountFromMilliunits(data.remainingAmount),
        incomeAmount: convertAmountFromMilliunits(data.incomeAmount),
        expenseAmount: convertAmountFromMilliunits(data.expenseAmount),
        expenseCategory: data.expenseCategory.map((category) => ({
          ...category,
          value: convertAmountFromMilliunits(category.value),
        })),
        incomeCategory: data.incomeCategory.map((category) => ({
          ...category,
          value: convertAmountFromMilliunits(category.value),
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMilliunits(day.income),
          expense: convertAmountFromMilliunits(day.expense),
        })),
        recentTransactions: data.recentTransactions.map((item) => ({
          ...item,
          amount: convertAmountFromMilliunits(item.amount),
        })),
      };
    },
  });

  return query;
};

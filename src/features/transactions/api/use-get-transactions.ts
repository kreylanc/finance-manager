import { client } from "@/lib/hono";
import { convertAmountFromMilliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetTransactions = () => {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["transactions", { from, to, accountId }], // pass a query key
    queryFn: async () => {
      // handle query function
      // get data from transactions table
      const response = await client.api.transactions.$get({
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
      return data.map((transaction) => ({
        ...transaction,
        amount: convertAmountFromMilliunits(transaction.amount),
      }));
    },
  });

  return query;
};

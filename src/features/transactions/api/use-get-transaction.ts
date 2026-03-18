import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

// Hook to get data of a single transaction from provided id
export const useGetTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id, // query only works when an id exists
    queryKey: ["transactions", { id }], // pass a query key
    queryFn: async () => {
      // handle query function
      // get data from transactions table
      const response = await client.api.transactions[":id"].$get({
        param: { id },
      });
      // throw error if fetch failed for TanStack query to handle error
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

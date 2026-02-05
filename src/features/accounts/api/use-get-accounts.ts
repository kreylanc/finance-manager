import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"], // pass a query key
    queryFn: async () => {
      // handle query function
      // get data from accounts table
      const response = await client.api.accounts.$get();
      // throw error if fetch failed for TanStack query to handle error
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

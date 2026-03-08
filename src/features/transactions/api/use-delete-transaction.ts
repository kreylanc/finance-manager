import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"]
>; // response type for transactions either on error or result

export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.transactions[":id"]["$delete"]({
        param: { id },
      });

      const result = await response.json();

      // Check if response is successful
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // refetches the transaction data when new transaction is deleted
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", { id }] });
      toast.success("transaction deleted.");

      //   !TODO: Invalidate summary
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction.");
    },
  });

  return mutation;
};

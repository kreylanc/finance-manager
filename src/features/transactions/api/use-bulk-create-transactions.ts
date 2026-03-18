import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>; // response type for transactions either on error or result
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions["bulk-create"].$post({
        json,
      });
      const result = await response.json();

      // Check if response is successful
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // refetches the transaction data when new transaction is created
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });

      toast.success("Transactions created.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transactions.");
    },
  });

  return mutation;
};

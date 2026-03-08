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
      return await response.json();
    },
    onSuccess: () => {
      // refetches the transaction data when new transaction is created
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transactions created.");
      //   !TODO: Invalidate summary
    },
    onError: (error) => {
      console.error("=== MUTATION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      toast.error("Failed to create transactions.");
    },
  });

  return mutation;
};

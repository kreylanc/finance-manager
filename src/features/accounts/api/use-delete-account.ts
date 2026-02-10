import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$delete"]
>; // response type for accounts either on error or result

export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.accounts[":id"].$delete({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      // refetches the account data when new account is created
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts", { id }] });
      toast.success("Account deleted.");
      //   !TODO: Invalidate summary
    },
    onError: (error) => {
      console.error("=== MUTATION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      toast.error("Failed to delete account.");
    },
  });

  return mutation;
};

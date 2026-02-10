import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>; // response type for categories either on error or result

export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.categories[":id"].$delete({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      // refetches the account data when new account is created
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", { id }] });
      toast.success("Category deleted.");
      //   !TODO: Invalidate summary
    },
    onError: (error) => {
      console.error("=== MUTATION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      toast.error("Failed to delete category.");
    },
  });

  return mutation;
};

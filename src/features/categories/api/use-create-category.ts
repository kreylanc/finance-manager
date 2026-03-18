import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.categories.$post>; // response type for categories either on error or result
type RequestType = InferRequestType<typeof client.api.categories.$post>["json"];

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.categories.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      // refetches the account data when new account is created
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created.");
    },
    onError: (err) => {
      toast.error("Failed to create category.");
    },
  });

  return mutation;
};

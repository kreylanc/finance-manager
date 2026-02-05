import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.accounts.$post>; // response type for accounts either on error or result
type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"];

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accounts.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      // refetches the account data when new account is created
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created.");
    },
    onError: (err) => {
      toast.error("Failed to create account.");
    },
  });

  return mutation;
};

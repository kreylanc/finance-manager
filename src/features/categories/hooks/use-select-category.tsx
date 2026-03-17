import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { useGetCategories } from "../api/use-get-categories";
import { useCreateCategory } from "../api/use-create-category";
import Select from "@/components/select";

export const useSelectCategory = (): [
  () => JSX.Element,
  () => Promise<unknown>,
] => {
  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();

  const onCreateCategory = (name: string) => {
    categoryMutation.mutate({
      name,
    });
  };

  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const [promise, setPromise] = useState<{
    resolve: (value: string | undefined) => void;
  } | null>(null);

  const selectValue = useRef<string>();

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const AccountDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Category</DialogTitle>
          <DialogDescription>
            Please select a category or leave empty to continue. (You can
            manually add category later.)
          </DialogDescription>
        </DialogHeader>
        <Select
          options={categoryOptions}
          placeholder="Add category"
          onCreate={onCreateCategory}
          onChange={(value) => (selectValue.current = value)}
          disabled={categoryQuery.isLoading || categoryMutation.isPending}
        />
        <DialogFooter className="mt-2">
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [AccountDialog, confirm];
};

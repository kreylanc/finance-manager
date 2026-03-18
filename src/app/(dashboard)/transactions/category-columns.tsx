import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

type Props = {
  id: string;
  category: string | null;
  categoryId: string | null;
};

export const CategoryColumns = ({ id, category, categoryId }: Props) => {
  const { onOpen: onOpenTransaction } = useOpenTransaction();
  const { onOpen: onOpenCategory } = useOpenCategory();

  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId);
    } else {
      onOpenTransaction(id);
    }
  };
  return (
    <div
      className={cn(
        "flex items-center cursor-pointer hover:underline",
        !category && "text-destructive",
      )}
      onClick={onClick}
    >
      {!category && <TriangleAlert className="mr-1 size-4" />}
      {category || "Uncategorized"}
    </div>
  );
};

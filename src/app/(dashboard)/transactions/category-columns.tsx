import { Badge } from "@/components/ui/badge";
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
    <Badge
      variant="outline"
      className={cn(
        "p-2 px-4 cursor-pointer text-sm hover:underline",
        !category && "text-destructive",
      )}
      onClick={onClick}
    >
      <span className="flex items-center mx-auto">
        {!category && <TriangleAlert className="mr-1 size-4" />}
        {category || "Uncategorized"}
      </span>
    </Badge>
  );
};

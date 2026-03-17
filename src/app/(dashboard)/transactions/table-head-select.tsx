import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
};

const options = ["amount", "date", "name", "notes", "dateBS"];

export const TableHeadSelect = ({
  columnIndex,
  selectedColumns,
  onChange,
}: Props) => {
  const currentSelection = selectedColumns[`column_${columnIndex}`];
  //   console.log(selectedColumns);

  return (
    <Select
      value={currentSelection || ""}
      onValueChange={(value) => onChange(columnIndex, value)}
    >
      <SelectTrigger
        className={cn(
          "focus:ring-offset-0 focus:ring-transparent border-none bg-transparent capitalize outline-none",
          currentSelection && "text-blue-500",
        )}
      >
        <SelectValue placeholder="Skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="skip">Skip</SelectItem>
        {options.map((option, index) => {
          // 1st condition check if the current option is already inside selectedColumns
          // 2nd contition check if the already selected option is for current column or not, if not then disable the option but enable for the column which has that option selected
          const disabled =
            Object.values(selectedColumns).includes(option) &&
            selectedColumns[`column_${columnIndex}`] !== option;

          var dateDisabled;
          if (option === "date") {
            dateDisabled =
              Object.values(selectedColumns).includes("dateBS") &&
              selectedColumns[`column_${columnIndex}`] !== "dateBS";
          } else if (option === "dateBS") {
            dateDisabled =
              Object.values(selectedColumns).includes("date") &&
              selectedColumns[`column_${columnIndex}`] !== "date";
          }

          return (
            <SelectItem
              key={index}
              value={option}
              className="capitalize"
              disabled={dateDisabled ? true : disabled}
            >
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

import CurrencyInput from "react-currency-input-field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { Info, MinusCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

const AmountInput = ({ value, onChange, placeholder, disabled }: Props) => {
  const parsedValue = parseFloat(value);
  const isIncome = parsedValue > 0;
  const isExpense = parsedValue < 0;

  // reverse the value depending on income or expense
  const onReverseValue = () => {
    if (!value) return;

    const newValue = parseFloat(value) * -1; // reverse value to -ve or +ve
    onChange(newValue.toString());
  };
  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={onReverseValue}
              className={cn(
                "absolute top-1 left-1.5 bg-slate-400 rounded-md p-2 flex items-center justify-center transition hover:bg-slate-500 h-8",
                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                isExpense && "bg-rose-500 hover:bg-rose-600",
              )}
            >
              {!value && <Info className="size-3" />}
              {isIncome && <PlusCircle className="size-2" />}
              {isExpense && <MinusCircle className="size-2" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Click [+] for income and [-] for expenses
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        prefix="Rs. "
        className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        name="amount-input"
        value={value || ""}
        decimalScale={2}
        decimalsLimit={2}
        onValueChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <span
        className={cn(
          "text-xs text-muted-foreground",
          isIncome && "text-emerald-500",
          isExpense && "text-rose-500 ",
        )}
      >
        {isIncome && "This will count as an income."}
        {isExpense && "This will count as an expense."}
      </span>
    </div>
  );
};

export default AmountInput;

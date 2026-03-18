import { format } from "date-fns";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { cn, formatCurrency } from "@/lib/utils";

const chartConfig = {
  income: {
    label: "Income",
    color: "#2563eb",
  },
  expense: {
    label: "Expense",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

type Props = {
  data?: {
    date: string;
    income: number;
    expense: number;
  }[];
};
export const BarVariant = ({ data }: Props) => {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          tickLine={false}
          axisLine={false}
          dataKey="date"
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{
            fontSize: "12px",
          }}
          tickMargin={10}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              key="bar"
              indicator="dot"
              labelFormatter={(value) => format(value, "dd MMM")}
              formatter={(value, name, indicator) => (
                <div className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
                  {!indicator.hide && (
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                      )}
                      style={
                        {
                          "--color-bg": indicator.color,
                          "--color-border": indicator.color,
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <div className="flex flex-1 justify-between items-center leading-none">
                    <span className="text-muted-foreground capitalize">
                      {name}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground ml-2">
                      {formatCurrency(value as number)}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          type={"monotone"}
          dataKey="income"
          stackId="income"
          fill="var(--color-income)"
          className="drop-shadow-sm"
        />
        <Bar
          type={"monotone"}
          dataKey="expense"
          stackId="expense"
          fill="var(--color-expense)"
          className="drop-shadow-sm"
        />
      </BarChart>
    </ChartContainer>
  );
};

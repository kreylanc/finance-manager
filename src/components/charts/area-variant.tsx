import { format } from "date-fns";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
};
type Props = {
  data?: {
    date: string;
    income: number;
    expense: number;
  }[];
};
export const AreaVariant = ({ data }: Props) => {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-income)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-income)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-expense)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-expense)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
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
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type={"monotone"}
          dataKey="income"
          stackId="income"
          strokeWidth={2}
          stroke="var(--color-income)"
          fill="url(#income)"
          className="drop-shadow-sm"
        />
        <Area
          type={"monotone"}
          dataKey="expense"
          stackId="expense"
          strokeWidth={2}
          stroke="var(--color-expense)"
          fill="url(#expense)"
          className="drop-shadow-sm"
        />
      </AreaChart>
    </ChartContainer>
  );
};

import { format } from "date-fns";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { cn, formatCurrency, labelDateFormatter } from "@/lib/utils";

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
  isNepaliCalendar: boolean;
};
export const LineVariant = ({ data, isNepaliCalendar }: Props) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] md:max-h-[300px] w-full"
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          tickLine={false}
          axisLine={false}
          dataKey="date"
          tickFormatter={(value) => labelDateFormatter(value, isNepaliCalendar)}
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
              labelFormatter={(value) =>
                labelDateFormatter(value, isNepaliCalendar)
              }
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
        <Line
          type={"monotone"}
          dataKey="income"
          stroke="var(--color-income)"
          strokeWidth={2}
          className="drop-shadow-sm"
          dot={false}
        />
        <Line
          type={"monotone"}
          dataKey="expense"
          stroke="var(--color-expense)"
          strokeWidth={2}
          dot={false}
          className="drop-shadow-sm"
        />
      </LineChart>
    </ChartContainer>
  );
};

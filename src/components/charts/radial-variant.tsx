import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Cell, RadialBar, RadialBarChart } from "recharts";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { useEffect, useState } from "react";

const COLORS = ["#2563eb", "#12C6FF", "#FF647f", "#FF9354"];

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};

export const RadialVariant = ({ data }: Props) => {
  // function to handle spaces and replace it with _
  const toKey = (name: string) => name.toLowerCase().replace(/\s+/g, "_");

  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    if (data) {
      setChartConfig(
        Object.fromEntries(
          data.map((item, i) => [
            toKey(item.name.toLowerCase()),
            {
              label:
                item.name.charAt(0).toUpperCase() +
                item.name.slice(1).toLowerCase(),
              color: COLORS[i % COLORS.length],
            },
          ]),
        ),
      );
    }
  }, [data]);

  const chartData = data?.map((item) => ({
    key: toKey(item.name), // used as x-axis / category
    ...item,
    fill: `var(--color-${toKey(item.name)})`,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
      <RadialBarChart
        data={chartData}
        barCategoryGap="10%"
        barGap={4}
        cx="50%"
        cy="30%"
        innerRadius="50%"
        outerRadius="80%"
      >
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              nameKey="name"
              formatter={(value, _, indicator) => {
                return (
                  <div className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
                    {!indicator.hide && (
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                        )}
                        style={
                          {
                            "--color-bg": indicator.payload.fill,
                            "--color-border": indicator.payload.fill,
                          } as React.CSSProperties
                        }
                      />
                    )}
                    <div className="flex flex-1 justify-between items-center leading-none">
                      <span className="text-muted-foreground capitalize">
                        {indicator.payload.name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground ml-2">
                        {formatCurrency((value as number) * -1)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <RadialBar data={chartData} dataKey="value" name="name" background>
          {/* {chartData?.map((entry, i) => (
            <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
          ))} */}
        </RadialBar>
        <ChartLegend
          content={({ payload }: any) => {
            return (
              <ul>
                {payload.map((entry: any, index: number) => (
                  <li
                    key={`item-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: entry.color,
                      }}
                    />
                    <div className="space-x-1">
                      <span className="text-sm text-muted-foreground">
                        {entry.value}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(entry.payload.value)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </RadialBarChart>
    </ChartContainer>
  );
};

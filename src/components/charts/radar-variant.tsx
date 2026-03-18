import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Cell, PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { useEffect, useState } from "react";

const COLORS = ["#2563eb", "#12C6FF", "#FF647f", "#FF9354"];

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};

export const RadarVariant = ({ data }: Props) => {
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
    key: [toKey(item.name)], // used as x-axis / category
    ...item,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
      <RadarChart data={chartData} cx="50%" cy="50%">
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _, indicator) => {
                return (
                  <div className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
                    <div className="flex flex-1 justify-between items-center leading-none">
                      <span className="text-muted-foreground capitalize">
                        {indicator.payload.name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground ml-2">
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <Radar dataKey="value" fill="#2563eb" fillOpacity={0.6}></Radar>
      </RadarChart>
    </ChartContainer>
  );
};

import {
  FileSearch,
  Loader2,
  PieChartIcon,
  RadarIcon,
  TargetIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PieVariant } from "./pie-variant";
import { RadarVariant } from "./radar-variant";
import { RadialVariant } from "./radial-variant";
import { Skeleton } from "../ui/skeleton";

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
  title: string;
};
export const PieCharts = ({ data = [], title }: Props) => {
  const [chartType, setChartType] = useState("pie");

  const onChartChange = (type: string) => {
    setChartType(type);
  };

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:items-center justify-between lg:flex-row">
        <CardTitle className="text-xl line-clamp-1">{title}</CardTitle>
        <Select onValueChange={onChartChange} defaultValue={chartType}>
          <SelectTrigger className="w-full lg:max-w-48">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">
              <div className="flex items-center">
                <PieChartIcon className="size-4 mr-2" />
                <span className="line-clamp-1">Pie Chart</span>
              </div>
            </SelectItem>
            <SelectItem value="radar">
              <div className="flex items-center">
                <RadarIcon className="size-4 mr-2" />
                <span className="line-clamp-1">Radar Chart</span>
              </div>
            </SelectItem>
            <SelectItem value="radial">
              <div className="flex items-center">
                <TargetIcon className="size-4 mr-2" />
                <span className="line-clamp-1">Radial Chart</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No data for this period
            </p>
          </div>
        ) : (
          <>
            {chartType === "pie" && <PieVariant data={data} />}
            {chartType === "radar" && <RadarVariant data={data} />}
            {chartType === "radial" && <RadialVariant data={data} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const PieChartsLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:items-center justify-between lg:flex-row">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-full lg:max-w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-y-4 items-center justify-center h-[250px] w-full">
          <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
};

import {
  AreaChartIcon,
  BarChart3Icon,
  FileSearch,
  LineChartIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AreaVariant } from "./area-variant";
import { BarVariant } from "./bar-variant";
import { LineVariant } from "./line-variant";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  data?: {
    date: string;
    income: number;
    expense: number;
  }[];
};
export const Chart = ({ data = [] }: Props) => {
  const [chartType, setChartType] = useState("area");

  const onChartChange = (type: string) => {
    setChartType(type);
  };

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:items-center justify-between lg:flex-row">
        <CardTitle className="text-xl line-clamp-1">Transactions</CardTitle>
        <Select onValueChange={onChartChange} defaultValue={chartType}>
          <SelectTrigger className="w-full lg:max-w-48">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area">
              <div className="flex items-center">
                <AreaChartIcon className="size-4 mr-2" />
                <span className="line-clamp-1">Area Chart</span>
              </div>
            </SelectItem>
            <SelectItem value="bar">
              <div className="flex items-center">
                <BarChart3Icon className="size-4 mr-2" />
                <span className="line-clamp-1">Bar Chart</span>
              </div>
            </SelectItem>
            <SelectItem value="line">
              <div className="flex items-center">
                <LineChartIcon className="size-4 mr-2" />
                <span className="line-clamp-1">Line Chart</span>
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
            {chartType === "area" && <AreaVariant data={data} />}
            {chartType === "bar" && <BarVariant data={data} />}
            {chartType === "line" && <LineVariant data={data} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";

export default function Dashboard() {
  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24 pb-20">
      <DataGrid />
      <DataCharts />
    </div>
  );
}

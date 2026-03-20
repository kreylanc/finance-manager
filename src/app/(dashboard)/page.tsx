import { DataCardLoading } from "@/components/data-card";
import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { Suspense } from "react";

function SearchBarFallback() {
  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24 pb-20">
      <div className="grid grid-cols-1 gap-8 pb-2 mb-8 lg:grid-cols-3">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    </div>
  );
}
export default function Dashboard() {
  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24 pb-20">
      <Suspense fallback={<SearchBarFallback />}>
        <DataGrid />
        <DataCharts />
      </Suspense>
    </div>
  );
}

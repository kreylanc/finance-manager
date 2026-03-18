import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { Suspense } from "react";

function SearchBarFallback() {
  return <>placeholder</>;
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

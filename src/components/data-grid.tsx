"use client";
import { formatDateRange } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DataCard, DataCardLoading } from "./data-card";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();

  const params = useSearchParams();
  const from = params.get("from") || undefined;
  const to = params.get("to") || undefined;

  const dateRangeLabel = formatDateRange({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 pb-2 mb-8 lg:grid-cols-3">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 pb-2 mb-8 lg:grid-cols-3">
      <DataCard
        title="Remaining"
        dateRange={dateRangeLabel}
        icon={PiggyBank}
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
      />
      <DataCard
        title="Income"
        dateRange={dateRangeLabel}
        icon={TrendingUp}
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
      />
      <DataCard
        title="Expense"
        dateRange={dateRangeLabel}
        icon={TrendingDown}
        value={data?.expenseAmount}
        percentageChange={data?.expenseChange}
        variant={"danger"}
      />
    </div>
  );
};

"use client";
import { formatDateRange, formatNepaliDateRange } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DataCard, DataCardLoading } from "./data-card";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import NepaliDate, { ADtoBS } from "nepali-date-library";
import { useNepaliCalendar } from "@/features/useNepaliCalendar";

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const { isNepaliCalendar } = useNepaliCalendar();

  const params = useSearchParams();
  const from = params.get("from") || undefined;
  const to = params.get("to") || undefined;

  const dateRangeLabel = formatDateRange({ from, to });

  const toNepaliDate = (dateAD?: string) => {
    if (dateAD) {
      return new NepaliDate(dateAD);
    } else {
      return new NepaliDate(new Date());
    }
  };

  const paramStateBS = {
    from: from ? toNepaliDate(ADtoBS(from)) : toNepaliDate(),
    to: to ? toNepaliDate(ADtoBS(to)) : toNepaliDate().addDays(-30),
  };
  const nepaliDateRangeLabel = formatNepaliDateRange(paramStateBS);

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
        dateRange={isNepaliCalendar ? nepaliDateRangeLabel : dateRangeLabel}
        icon={PiggyBank}
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
      />
      <DataCard
        title="Income"
        dateRange={isNepaliCalendar ? nepaliDateRangeLabel : dateRangeLabel}
        icon={TrendingUp}
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
      />
      <DataCard
        title="Expense"
        dateRange={isNepaliCalendar ? nepaliDateRangeLabel : dateRangeLabel}
        icon={TrendingDown}
        value={data?.expenseAmount}
        percentageChange={data?.expenseChange}
        variant={"danger"}
      />
    </div>
  );
};

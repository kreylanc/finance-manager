"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { Chart } from "./charts/chart";
import { SpendingPie, SpendingPieLoading } from "./charts/spending-pie";
import {
  RecentTransactions,
  RecentTransactionsLoading,
} from "./recent-transactions";

export const DataCharts = () => {
  const { data, isLoading } = useGetSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
        <div className="col-span-1 lg:col-span-3">
          <SpendingPieLoading />
        </div>
        <div className="cols-span-1 lg:col-span-3">
          <SpendingPieLoading />
        </div>
        <div className="cols-span-1 lg:col-span-3">
          <SpendingPieLoading />
        </div>
        <div className="cols-span-1 lg:col-span-3">
          <RecentTransactionsLoading />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
      <div className="col-span-1 lg:col-span-3">
        <Chart data={data?.days} />
      </div>
      <div className="cols-span-1 lg:col-span-3">
        <SpendingPie data={data?.expenseCategory} title="Expense by category" />
      </div>
      <div className="cols-span-1 lg:col-span-3">
        <SpendingPie data={data?.incomeCategory} title="Income by category" />
      </div>
      <div className="cols-span-1 lg:col-span-3">
        <RecentTransactions data={data?.recentTransactions} />
      </div>
    </div>
  );
};

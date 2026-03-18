import { Suspense } from "react";
import { AccountFilter } from "./account-filter";
import { DateFilter } from "./date-filter";

function SearchBarFallback() {
  return <>placeholder</>;
}
export const Filters = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg: gap-x-2">
      <Suspense fallback={<SearchBarFallback />}>
        <AccountFilter />
        <DateFilter />
      </Suspense>
    </div>
  );
};

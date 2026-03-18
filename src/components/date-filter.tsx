"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { format, subDays } from "date-fns";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { formatDateRange } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { ChevronDown } from "lucide-react";

export const DateFilter = () => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const accountId = params.get("accountId");
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>(paramState);

  const pushToURL = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
      accountId,
    };

    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true },
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToURL(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-between rounded-md px-3 h-9 font-normal bg-white/10 outline-none text-primary-foreground border-none hover:bg-white/20 hover:text-primary-foreground lg:max-w-48 focus:ring-offset-blue-500 transition"
        >
          <span>{formatDateRange(paramState)}</span>
          <span>
            <ChevronDown className="opacity-60" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 lg:w-auto" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          onSelect={setDate}
          selected={date}
          numberOfMonths={2}
        />
        <div className="flex items-center gap-2 p-4">
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!date?.from || !date?.to}
              className="w-full"
              variant="outline"
            >
              Reset
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={() => pushToURL(date)}
              disabled={!date?.from || !date?.to}
              className="w-full"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

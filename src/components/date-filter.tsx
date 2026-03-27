"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { endOfDay, format } from "date-fns";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { formatDateRange, formatNepaliDateRange } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { ChevronDown } from "lucide-react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { CalendarBS } from "./ui/calendarBS";
import NepaliDate from "nepali-date-library";
import { useNepaliCalendar } from "@/features/useNepaliCalendar";

export const DateFilter = () => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const { isLoading: isLoadingSummary } = useGetSummary();

  const accountId = params.get("accountId");
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = endOfDay(new Date());
  const defaultFrom = new Date(
    new Date(defaultTo.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0] + "T00:00:00Z",
  );

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };

  const paramStateBS = {
    from: new NepaliDate(paramState.from),
    to: new NepaliDate(paramState.to),
  };

  const [date, setDate] = useState<DateRange | undefined>(paramState);
  const [nepaliDate, setNepaliDate] = useState<typeof paramStateBS | undefined>(
    paramStateBS,
  );

  const { isNepaliCalendar, setIsNepaliCalendar } = useNepaliCalendar();

  const isDisabled = isNepaliCalendar
    ? !nepaliDate?.from || !nepaliDate?.to
    : !date?.from || !date?.to;

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
    setNepaliDate(undefined);
    pushToURL(undefined);
  };

  return (
    <div className="flex flex-col w-full gap-x-4 gap-y-2 items-center justify-between sm:flex-row lg:w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex-grow w-full justify-between rounded-md px-3 h-9 font-normal bg-white/10 outline-none text-primary-foreground border-none hover:bg-white/20 hover:text-primary-foreground sm:w-auto lg:max-w-48 focus:ring-offset-blue-500 transition"
            disabled={isLoadingSummary}
          >
            {isNepaliCalendar ? (
              <span>{formatNepaliDateRange(paramStateBS)}</span>
            ) : (
              <span>{formatDateRange(paramState)}</span>
            )}
            <span>
              <ChevronDown className="opacity-60" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 lg:w-auto" align="start">
          {isNepaliCalendar ? (
            <CalendarBS
              onRangeSelect={(value) => {
                setNepaliDate(value);
                setDate({
                  from: value.from.timestamp,
                  to: value.to.timestamp,
                });
              }}
              mode="range"
              value={nepaliDate}
              defaultMonth={nepaliDate?.from}
            />
          ) : (
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              onSelect={setDate}
              selected={date}
              numberOfMonths={2}
            />
          )}

          <div className="flex items-center gap-2 p-4">
            <PopoverClose asChild>
              <Button
                onClick={onReset}
                disabled={isDisabled}
                className="w-full"
                variant="outline"
              >
                Reset
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button
                onClick={() => pushToURL(date)}
                disabled={isDisabled}
                className="w-full"
              >
                Apply
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex justify-around items-center gap-x-2 line-clamp-1">
        <Switch
          id="nepali-date-mode"
          onCheckedChange={(value) => setIsNepaliCalendar(value)}
        />
        <Label htmlFor="nepali-date-mode" className="line-clamp-1">
          BS Year
        </Label>
      </div>
    </div>
  );
};

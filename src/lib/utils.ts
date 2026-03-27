import { type ClassValue, clsx } from "clsx";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import NepaliDate, { ADtoBS } from "nepali-date-library";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// use to convert amount in transaction from two decimal unit to whole integer
// makes easy to store value and cross compatible
export function convertAmountToMilliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function convertAmountFromMilliunits(amount: number) {
  return Math.round(amount / 1000);
}

export function formatCurrency(amount: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false },
) {
  const result = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);

  if (options.addPrefix && value > 0) {
    return `+${result}`;
  }

  return result;
}

// function to fill the days that has no transactions with empty (0) values
export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expense: number;
  }[],
  startDate: Date,
  endDate: Date,
) {
  if (activeDays.length === 0) {
    return [];
  }
  // get each day from the select start and end date
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  // map each day and check if the day is already present in our data
  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));

    if (found) {
      return found;
    } else {
      // if day is not present, return the day with income and expsense as 0
      return {
        date: day,
        income: 0,
        expense: 0,
      };
    }
  });
  return transactionsByDay;
}

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};

export function formatDateRange(period?: Period) {
  // set the default dates from current date to last 30 days
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  // if user hasnt passed a date to show from
  if (!period?.from) {
    // formats the date to something like "Feb 11 - March 13"
    return `${format(defaultFrom, "LLL dd")} - ${format(defaultTo, "LLL dd, y")}`;
  }
  // if user has selected a "to" date
  if (period?.to) {
    return `${format(period.from, "LLL dd")} - ${format(period.to, "LLL dd, y")}`;
  }

  // return only the "from" date
  return format(period.from, "LLL dd, y");
}

export function formatNepaliDateRange(period: {
  from?: NepaliDate;
  to?: NepaliDate;
}) {
  return `${period.from?.format("MMM D")} - ${period.to?.format("MMM D, YYYY")}`;
}

export function labelDateFormatter(date: string, isNepaliCalendar: boolean) {
  if (isNepaliCalendar) {
    const convertedDate = ADtoBS(format(date, "yyyy-MM-dd"));
    return new NepaliDate(convertedDate).format("DD MMM");
  } else {
    return format(date, "dd MMM");
  }
}

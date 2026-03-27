import { ChevronLeft, ChevronRight } from "lucide-react";
import { NepaliDate } from "nepali-date-library";
import { useState, useMemo, useRef } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SingleProps {
  onDateSelect?: (date: NepaliDate) => void;
  value?: NepaliDate;
  mode?: "single";
  defaultMonth?: NepaliDate;
}

interface RangeProps {
  mode?: "range";
  onRangeSelect?: (range: { from: NepaliDate; to: NepaliDate }) => void;
  value?: { from: NepaliDate; to: NepaliDate };
  defaultMonth?: NepaliDate;
}

type CalendarProps = SingleProps | RangeProps;

export function CalendarBS(props: CalendarProps) {
  // destructuring the props to set initial values
  const { mode = "single", defaultMonth = new NepaliDate() } = props;
  const singleProps = mode === "single" ? (props as SingleProps) : null;
  const rangeProps = mode === "range" ? (props as RangeProps) : null;
  const currentDate = new NepaliDate(new Date());
  // to ref the day button
  const buttonRefs = useRef<HTMLButtonElement | null[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Used for which month to display at first
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  // track selected date in order to apply different styling to it
  const [selectedDate, setSelectedDate] = useState<NepaliDate | null>(
    singleProps?.value ?? null,
  ); // for single selection mode

  // for range selection mode
  const [rangeStart, setRangeStart] = useState<NepaliDate | null>(
    rangeProps?.value?.from ?? null,
  );
  const [rangeEnd, setRangeEnd] = useState<NepaliDate | null>(
    rangeProps?.value?.to ?? null,
  );

  const [hoverDate, setHoverDate] = useState<NepaliDate | null>(null);

  const calendarDays = useMemo(() => {
    const days = NepaliDate.getCalendarDays(
      currentMonth.getYear(),
      currentMonth.getMonth(),
    );

    // Calculate how many days from next month we actually need
    const totalDaysShown =
      days.prevMonth.days.length + days.currentMonth.days.length;

    const weeksNeeded = Math.ceil(totalDaysShown / 7); // result would be 5 or 6
    const nextMonthDaysNeeded = weeksNeeded * 7 - totalDaysShown; // total cells needed to display - minus days already in the cell

    // Trim or pad the next month days
    if (nextMonthDaysNeeded > 0) {
      days.nextMonth.days = days.nextMonth.days.slice(0, nextMonthDaysNeeded);
    } else {
      days.nextMonth.days = [];
    }
    return days;
  }, [currentMonth]);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const goToPrevMonth = () => {
    // ? passing -1 to addMonths at the start of the month results in decreasing year by 2 for some reason
    // Using this as the work around for now
    let newYear = currentMonth.getYear();
    let newMonth = currentMonth.getMonth() - 1;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonth(new NepaliDate(newYear, newMonth, currentMonth.getDate()));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => prev.addMonths(1));
  };

  // Check if the given date is same as selected date
  const isDateSelected = (date: NepaliDate) => {
    if (mode === "single") {
      if (!selectedDate) return false;
      return selectedDate.isEqual(date);
    }

    if (rangeStart && rangeStart.isEqual(date)) {
      return true;
    }
    if (rangeEnd && rangeEnd.isEqual(date)) {
      return true;
    }
    return false;
  };

  // to check if the day falls between the start and end date
  const isInRange = (date: NepaliDate) => {
    if (mode !== "range") return false;
    // set the end date to rangeEnd, if not hoverDate else null
    const end = rangeEnd ? rangeEnd : hoverDate ? hoverDate : null;
    if (!rangeStart || !end) return false;

    // compare it to the rangeStart and rangeEnd value
    const [lo, hi] = rangeStart.isBefore(end)
      ? [rangeStart, end]
      : [end, rangeStart];
    return date.isAfter(lo) && date.isBefore(hi);
  };

  const isRangeStart = (date: NepaliDate) => {
    if (mode !== "range" || !rangeStart) return false;

    return rangeStart.isEqual(date);
  };
  const isRangeEnd = (date: NepaliDate) => {
    if (mode !== "range") return false;

    if (rangeEnd) return rangeEnd.isEqual(date);
    if (!rangeEnd && hoverDate) return hoverDate.isEqual(date);

    return false;
  };

  // compare the current date with the given day, month and year to apply different styling to current date
  const isCurrentDate = (date: NepaliDate) => {
    return currentDate.isEqual(date);
  };

  const handleDayClick = (
    day: number,
    monthType: "prev" | "current" | "next",
  ) => {
    // store prev, current, next year and month
    const yearMap = {
      prev: calendarDays.prevMonth.year,
      current: calendarDays.currentMonth.year,
      next: calendarDays.nextMonth.year,
    };
    const monthMap = {
      prev: calendarDays.prevMonth.month,
      current: calendarDays.currentMonth.month,
      next: calendarDays.nextMonth.month,
    };
    // create a date according to the day user clicked
    let date = new NepaliDate(yearMap[monthType], monthMap[monthType], day);

    if (mode === "single") {
      setSelectedDate(date);
      singleProps?.onDateSelect?.(date);
      return;
    }

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // range start and end date is already selected or no start date
      // set the current clicked day as range start and range end as null
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      // setting the start and end range date
      // if currently selected date is before range start, keep the current date as from date if not as to date
      const [from, to] = date.isBefore(rangeStart)
        ? [date, rangeStart]
        : [rangeStart, date];
      setRangeStart(from);
      setRangeEnd(to);
      rangeProps?.onRangeSelect?.({ from, to });
    }
  };

  const handleDayHover = (
    day: number,
    monthType: "prev" | "current" | "next",
  ) => {
    if (mode !== "range" || !rangeStart || rangeEnd) return;
    const yearMap = {
      prev: calendarDays.prevMonth.year,
      current: calendarDays.currentMonth.year,
      next: calendarDays.nextMonth.year,
    };
    const monthMap = {
      prev: calendarDays.prevMonth.month,
      current: calendarDays.currentMonth.month,
      next: calendarDays.nextMonth.month,
    };
    setHoverDate(new NepaliDate(yearMap[monthType], monthMap[monthType], day));
  };

  const getDayClass = (
    day: number,
    year: number,
    month: number,
    isOtherMonth: boolean,
  ) => {
    const currentSelectedDate = new NepaliDate(year, month, day);
    const selected = isDateSelected(currentSelectedDate);
    const inRange = isInRange(currentSelectedDate);
    const start = isRangeStart(currentSelectedDate);
    const end = isRangeEnd(currentSelectedDate);
    const today = isCurrentDate(currentSelectedDate);

    var tabIndex = -1;
    if (selected) {
      if (start || (!rangeStart && !rangeEnd)) {
        tabIndex = 0;
      }
    } else if (!rangeStart && !selectedDate && today) {
      tabIndex = 0;
    }

    const dayStyle = cn(
      "w-8 h-8 flex items-center justify-center text-sm cursor-pointer relative",
      isOtherMonth ? "text-muted-foreground" : "",
      inRange && "bg-accent rounded-none",
      start && "rounded-l-md",
      end && "rounded-r-md",
      !start && !end && !inRange && "rounded-md",
      selected &&
        "bg-primary text-primary-foreground ring-2 ring-offset-background ring-zinc-400 hover:bg-primary hover:text-primary-foreground z-50 rounded-md",
      !selected && today && "bg-muted text-primary rounded-md",
      today && inRange && "rounded-none",
      !selected && !inRange && "hover:bg-muted rounded-md",
    );

    return { dayStyle, tabIndex };
  };

  // const handleArrowKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
  //   console.log(buttonRefs.current);

  //   if (e.key === "ArrowRight") {
  //     e.preventDefault();

  //     console.log("arrow right");
  //   }
  //   if (e.key === "ArrowLeft") {
  //     e.preventDefault();

  //     console.log("arrow left");
  //   }
  //   if (e.key === "ArrowUp") {
  //     e.preventDefault();

  //     console.log("arrow up");
  //   }
  //   if (e.key === "ArrowDown") {
  //     e.preventDefault();

  //     console.log("arrow down");
  //   }
  // };

  return (
    <div className="px-4 py-2 max-w-sm h-auto">
      {/* Month Year display */}
      <div className="flex items-center justify-center gap-x-2 text-sm">
        <Button
          size="icon"
          variant="ghost"
          onClick={goToPrevMonth}
          className="text-sm"
        >
          <ChevronLeft className="flex size-2" />
        </Button>
        <span className="flex-1 text-center font-semibold">
          {currentMonth.format("MMMM YYYY")}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={goToNextMonth}
          className="hover:bg-muted"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mt-4">
        {weekdays.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center text-muted-foreground text-xs font-normal"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 mt-2 text-sm">
        {(["prev", "current", "next"] as const).map((monthType) =>
          calendarDays[`${monthType}Month`].days.map((day, index) => {
            const year = calendarDays[`${monthType}Month`].year;
            const month = calendarDays[`${monthType}Month`].month;

            const { dayStyle, tabIndex } = getDayClass(
              day,
              year,
              month,
              monthType !== "current",
            );
            return (
              <Button
                variant="ghost"
                size={"icon"}
                key={`${monthType}-${day}`}
                className={dayStyle}
                onClick={() => handleDayClick(day, monthType)}
                onMouseEnter={() => handleDayHover(day, monthType)}
                onMouseLeave={() => setHoverDate(null)}
              >
                {day}
              </Button>
            );
          }),
        )}
      </div>
    </div>
  );
}

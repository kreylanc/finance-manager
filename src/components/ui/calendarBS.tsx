import { ChevronLeft, ChevronRight } from "lucide-react";
import { NepaliDate } from "nepali-date-library";
import { useState, useMemo } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface CalendarProps {
  onDateSelect?: (date: NepaliDate) => void;
  value?: NepaliDate;
}

export function CalendarBS({ onDateSelect, value }: CalendarProps) {
  const currentDate = new NepaliDate(new Date());

  const [currentMonth, setCurrentMonth] = useState(() => new NepaliDate());
  // track selected date in order to apply different styling to it
  const [selectedDate, setSelectedDate] = useState<NepaliDate | null>(
    value || null,
  );

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
  }, [currentMonth, onDateSelect]);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => prev.addMonths(-1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => prev.addMonths(1));
  };

  // Check if the given day, month and year is same as selected date
  const isDateSelected = (day: number, year: number, month: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getYear() === year
    );
  };
  // compare the current date with the given day, month and year to apply different styling to current date
  const isCurrentDate = (day: number, year: number, month: number) => {
    return (
      currentDate.getDate() === day &&
      currentDate.getMonth() === month &&
      currentDate.getYear() === year
    );
  };

  const handleDayClick = (
    day: number,
    monthType: "prev" | "current" | "next",
  ) => {
    let date: NepaliDate;

    if (monthType === "prev") {
      date = new NepaliDate(
        calendarDays.prevMonth.year,
        calendarDays.prevMonth.month,
        day,
      );
    } else if (monthType === "next") {
      date = new NepaliDate(
        calendarDays.nextMonth.year,
        calendarDays.nextMonth.month,
        day,
      );
    } else {
      date = new NepaliDate(
        calendarDays.currentMonth.year,
        calendarDays.currentMonth.month,
        day,
      );
    }
    setSelectedDate(date);

    onDateSelect?.(date);
  };

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
            className="flex items-center justify-center text-muted-foreground text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1.5 mt-2 text-sm">
        {/* Previous month days*/}
        {calendarDays.prevMonth.days.map((day) => (
          <button
            key={`prev-${day}`}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:bg-muted",
              isDateSelected(
                day,
                calendarDays.prevMonth.year,
                calendarDays.prevMonth.month,
              ) &&
                "bg-primary text-primary-foreground ring-2 ring-offset-background ring-zinc-400 hover:bg-primary hover:text-primary-foreground z-50",
            )}
            onClick={() => handleDayClick(day, "prev")}
          >
            {day}
          </button>
        ))}
        {/* Current month days */}

        {calendarDays.currentMonth.days.map((day) => (
          <button
            key={`current-${day}`}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-muted",
              isDateSelected(
                day,
                calendarDays.currentMonth.year,
                calendarDays.currentMonth.month,
              ) &&
                "bg-primary text-primary-foreground ring-2 ring-offset-background ring-zinc-400 hover:bg-primary hover:text-primary-foreground z-50",
              isCurrentDate(
                day,
                calendarDays.currentMonth.year,
                calendarDays.currentMonth.month,
              ) &&
                !isDateSelected(
                  day,
                  calendarDays.currentMonth.year,
                  calendarDays.currentMonth.month,
                ) &&
                "bg-muted text-primary",
            )}
            onClick={() => handleDayClick(day, "current")}
          >
            {day}
          </button>
        ))}
        {/* Next month days */}
        {calendarDays.nextMonth.days.map((day) => (
          <button
            key={`next-${day}`}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:bg-muted",
              isDateSelected(
                day,
                calendarDays.nextMonth.year,
                calendarDays.nextMonth.month,
              ) &&
                "bg-primary text-primary-foreground ring-2 ring-offset-background ring-zinc-400 hover:bg-primary hover:text-primary-foreground z-50",
            )}
            onClick={() => handleDayClick(day, "next")}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

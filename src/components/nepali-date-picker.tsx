import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { CalendarBS } from "./ui/calendarBS";
import NepaliDate from "nepali-date-library";
import { useEffect, useState } from "react";

type Props = {
  value?: Date | string;
  onChange: (date: NepaliDate) => void;
  disabled?: boolean;
};

const NepaliDatePicker = ({ value, onChange, disabled }: Props) => {
  const [nepaliDate, setNepaliDate] = useState<NepaliDate>();

  useEffect(() => {
    if (!value) {
      setNepaliDate(undefined);
      return;
    }

    let nd: NepaliDate;
    // value type can be instance of Date when user picks AD date
    // so we need to convert it to format it into value that NepaliDate function accepts
    if (value instanceof Date) {
      const dateBS = format(value, "yyyy-MM-dd");
      nd = new NepaliDate(dateBS);
    } else {
      nd = new NepaliDate(value);
    }

    setNepaliDate(nd); // Format the date as "Month Day, Year" same as AD date picker for consistency
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <CalendarIcon />
          {value ? (
            nepaliDate?.format("MMMM DD, YYYY")
          ) : (
            <span>Pick a nepali date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarBS onDateSelect={onChange} value={nepaliDate} />
      </PopoverContent>
    </Popover>
  );
};
export default NepaliDatePicker;

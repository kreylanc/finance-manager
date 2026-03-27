import { create } from "zustand";

type NepaliCalendarState = {
  isNepaliCalendar: boolean;
  setIsNepaliCalendar: (value: boolean) => void;
};

export const useNepaliCalendar = create<NepaliCalendarState>((set) => ({
  isNepaliCalendar: false,
  setIsNepaliCalendar: (isNepaliCalendar) =>
    set(() => ({ isNepaliCalendar: isNepaliCalendar })),
}));

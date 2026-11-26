import { addMinutes, format, isValid, parse } from "date-fns";
import { Check } from "lucide-react";
import { useCallback, useMemo } from "react";

import Combobox, { ComboboxOption } from "@/components/ui/combobox";
import { TIME_SLOT_INTERVAL_MINUTES } from "@/store/eventDataSlice";
import { EVENT_TIME_FORMAT } from "@/types/Timeslot";
import { matchesTimeSearch } from "@/utils/timeSearch";

export const TIME_LABEL_FORMAT = "h:mm aa";
export const NEXT_DAY_MIDNIGHT_OPTION = {
  label: "12:00 am +1",
  value: "00:00:00"
};

type TimeOption = { label: string } & ComboboxOption;

export interface NewEventFromTimeDropdownProps {
  error: boolean;
  isStartTime: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
  selected: string;
}

function getTimeOptions(isStartTime: boolean): TimeOption[] {
  const startTime = new Date(0, 0, 0, 0, isStartTime ? 0 : 30);
  const endTime = new Date(0, 0, 0, 23, 30);

  const timeOptions: TimeOption[] = [];
  for (let currentTime = startTime; currentTime <= endTime;) {
    const value = format(currentTime, EVENT_TIME_FORMAT);
    timeOptions.push({ key: value, label: format(currentTime, TIME_LABEL_FORMAT).toUpperCase(), value });
    currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL_MINUTES);
  }
  if (!isStartTime) timeOptions.push({ key: "next-day", label: "12:00 AM (+1 day)", value: "00:00:00" });
  return timeOptions;
}

// "9", "9pm", "930", "9:30 pm", "21:00" → "21:00:00" (only times the list offers)
function parseTypedTime(text: string, options: TimeOption[]): null | string {
  const match = text
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::?(\d{2}))?\s*(a|p)?\.?m?\.?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3];
  if (minutes > 59 || hours > 23) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem === "p" ? 12 : 0);
  } else if (hours < 13 && match[1].length === 1) {
    // "9" alone is ambiguous: let the list's first match (AM before PM) decide
    return null;
  }
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  return options.some((option) => option.value === value) ? value : null;
}

// Start / end time on the create page: type a time ("9:30pm") or pick one from the list.
export default function NewEventFromTimeDropdown({
  error,
  isStartTime,
  onBlur,
  onChange,
  selected
}: NewEventFromTimeDropdownProps) {
  const timeOptions = useMemo(() => getTimeOptions(isStartTime), [isStartTime]);

  const getOptions = useCallback(
    (query: string) => timeOptions.filter(({ label }) => matchesTimeSearch(label, query, TIME_SLOT_INTERVAL_MINUTES)),
    [timeOptions]
  );

  function displayValue(value: string) {
    if (!isStartTime && value === "00:00:00") return "12:00 AM (+1 day)";
    const parsed = parse(value, EVENT_TIME_FORMAT, new Date());
    return isValid(parsed) ? format(parsed, TIME_LABEL_FORMAT).toUpperCase() : "";
  }

  return (
    <Combobox<TimeOption>
      ariaLabel={isStartTime ? "Start time" : "End time"}
      displayValue={displayValue}
      emptyMessage="Invalid time"
      error={error}
      getOptions={getOptions}
      onBlur={onBlur}
      onChange={onChange}
      parseTyped={(text) => parseTypedTime(text, timeOptions)}
      placeholder={isStartTime ? "Start" : "End"}
      renderOption={({ label }, { isSelected }) => (
        <span className="flex w-full items-center justify-between">
          {label}
          {isSelected && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
        </span>
      )}
      showChevron
      value={selected}
    />
  );
}

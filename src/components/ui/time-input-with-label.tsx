import { cn } from "@/lib/utils";
import React, { useRef } from "react";

import { Label } from "./label";

export interface TimeInputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ampm: string;
  hour: string;
  id: string;
  label?: string;
  minute: string;
  setAmPm: React.Dispatch<React.SetStateAction<string>>;
  setHour: React.Dispatch<React.SetStateAction<string>>;
  setMinute: React.Dispatch<React.SetStateAction<string>>;
  variant: "default" | "error";
}

type Input = "ampm" | "hour" | "minute";

export default function TimeInputWithLabel({
  ampm,
  hour,
  id,
  label,
  minute,
  setAmPm,
  setHour,
  setMinute,
  variant
}: TimeInputWithLabelProps) {
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const ampmInputRef = useRef<HTMLInputElement>(null);

  const previousHour = useRef(hour);

  function handleHourChange(e: React.ChangeEvent<HTMLInputElement>) {
    const validHours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    const toValidate = e.target.value;
    if (toValidate === "") {
      setHour("");
    } else {
      if (validHours.includes(toValidate)) {
        setHour(toValidate);
      } else {
        validHours.forEach((hour) => {
          if (toValidate.startsWith(hour)) {
            const newHour = toValidate.substring(hour.length);
            if (validHours.includes(newHour)) {
              setHour(newHour);
            }
          }
        });
      }
    }
  }

  function handleHourBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setHour(previousHour.current);
    } else {
      previousHour.current = e.target.value;
    }
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const toValidate = e.target.value;

    if (toValidate === "") {
      setMinute("");
      return;
    }

    const isNumeric = /^\d+$/.test(toValidate);
    if (!isNumeric || toValidate.length > 2) return;

    const parsedValue = parseInt(toValidate);
    if (toValidate.length === 1 && parsedValue > 5) {
      setMinute(`0${toValidate}`);
    } else {
      setMinute(toValidate);
    }
  }

  function handleMinuteBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.target.value === "" || e.target.value === "0" || e.target.value === "00") {
      setMinute("00");
    } else {
      setMinute("30");
    }
  }

  function handleAmPmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const toValidate = e.target.value;
    if (toValidate === "a" || toValidate === "pma") {
      setAmPm("am");
    } else if (toValidate === "p" || toValidate === "amp") {
      setAmPm("pm");
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLInputElement, MouseEvent>, input: Input) {
    e.preventDefault();
    setCursorToEnd(input);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>, input: Input) {
    e.preventDefault();
    setCursorToEnd(input);
  }

  function setCursorToEnd(input: Input) {
    if (input === "hour") {
      if (hourInputRef.current) {
        const length = hourInputRef.current.value.length;
        hourInputRef.current.focus();
        hourInputRef.current.setSelectionRange(0, length);
      }
    } else if (input === "minute") {
      if (minuteInputRef.current) {
        const length = minuteInputRef.current.value.length;
        minuteInputRef.current.setSelectionRange(0, length);
        minuteInputRef.current.focus();
      }
    } else {
      if (ampmInputRef.current) {
        const length = ampmInputRef.current.value.length;
        ampmInputRef.current.setSelectionRange(0, length);
        ampmInputRef.current.focus();
      }
    }
  }

  function handleArrowLeftKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
    }
  }

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "peer box-border flex h-10 w-32 items-center rounded-2xl bg-background px-4 pb-2.5 pt-3 text-sm outline outline-2 outline-primary/40 focus-within:outline-primary hover:outline-primary",
          {
            "outline-red-600/40 focus-within:outline-red-600 hover:outline-red-600": variant === "error"
          }
        )}
      >
        <input
          className={cn(
            "selection-transparent peer w-5 select-none appearance-none rounded-[4px] border-0 pr-[1px] text-end caret-transparent outline-none focus:bg-accent",
            {
              "focus:bg-red-100": variant === "error"
            }
          )}
          onBlur={handleHourBlur}
          onChange={handleHourChange}
          onFocus={(e) => handleFocus(e, "hour")}
          onKeyDown={handleArrowLeftKeyDown}
          onMouseDown={(e) => handleMouseDown(e, "hour")}
          ref={hourInputRef}
          value={hour}
        />
        <p className="pb-[2px]">:</p>
        <input
          className={cn(
            "selection-transparent w-5 rounded-[4px] border-0 pl-[1px] caret-transparent outline-none focus:bg-accent",
            {
              "focus:bg-red-100": variant === "error"
            }
          )}
          onBlur={handleMinuteBlur}
          onChange={handleMinuteChange}
          onFocus={(e) => handleFocus(e, "minute")}
          onKeyDown={handleArrowLeftKeyDown}
          onMouseDown={(e) => handleMouseDown(e, "minute")}
          ref={minuteInputRef}
          value={minute}
        />
        <input
          className={cn(
            "selection-transparent peer ml-[1px] w-6 rounded-[4px] border-0 pl-[1px] caret-transparent outline-none focus:bg-accent",
            {
              "focus:bg-red-100": variant === "error"
            }
          )}
          onChange={handleAmPmChange}
          onFocus={(e) => handleFocus(e, "ampm")}
          onKeyDown={handleArrowLeftKeyDown}
          onMouseDown={(e) => handleMouseDown(e, "ampm")}
          ref={ampmInputRef}
          value={ampm}
        />
      </div>
      <Label
        className={cn(
          "absolute left-1 top-1.5 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-sm bg-background px-3 text-sm text-black duration-300 peer-focus-within:px-2"
        )}
        htmlFor={id}
      >
        {label}
      </Label>
    </div>
  );
}

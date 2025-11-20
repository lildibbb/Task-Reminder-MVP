"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );
  const [timeFormat, setTimeFormat] = React.useState<"24h" | "12h">("24h");
  const [selectedHour, setSelectedHour] = React.useState(() => {
    if (!date) return "09";
    return timeFormat === "24h" ? format(date, "HH") : format(date, "hh");
  });
  const [selectedMinute, setSelectedMinute] = React.useState(() => {
    if (!date) return "00";
    return format(date, "mm");
  });
  const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(
    () => {
      if (!date) return "AM";
      return format(date, "a") as "AM" | "PM";
    },
  );

  const isMobile = useIsMobile();

  const hours =
    timeFormat === "24h"
      ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
      : Array.from({ length: 12 }, (_, i) =>
          (i + 1).toString().padStart(2, "0"),
        );

  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0"),
  );
  const periods = ["AM", "PM"];

  const updateTime = React.useCallback(
    (hour: string, minute: string, period: "AM" | "PM") => {
      let hourNum = Number.parseInt(hour);

      if (timeFormat === "12h") {
        if (period === "PM" && hourNum < 12) hourNum += 12;
        else if (period === "AM" && hourNum === 12) hourNum = 0;
      }

      if (selectedDate) {
        const updatedDate = new Date(selectedDate);
        updatedDate.setHours(hourNum, Number.parseInt(minute), 0, 0);
        setSelectedDate(updatedDate);
        onDateChange(updatedDate);
      }
    },
    [selectedDate, timeFormat, onDateChange],
  );

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    updateTime(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    updateTime(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodSelect = (period: "AM" | "PM") => {
    setSelectedPeriod(period);
    updateTime(selectedHour, selectedMinute, period);
  };

  React.useEffect(() => {
    if (selectedDate) {
      setSelectedHour(
        timeFormat === "24h"
          ? format(selectedDate, "HH")
          : format(selectedDate, "hh"),
      );
      setSelectedMinute(format(selectedDate, "mm"));
      setSelectedPeriod(format(selectedDate, "a") as "AM" | "PM");
    }
  }, [selectedDate, timeFormat]);

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    setTimeout(() => setStep(2), 200);
  };

  const handleApply = () => {
    setIsOpen(false);
    setStep(1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the popover from opening
    setSelectedDate(undefined);
    onDateChange(undefined);
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
    setStep(1);
  };

  const handleQuickTimeSelect = (time: string) => {
    const [h, m] = time.split(":");
    const hour24 = Number.parseInt(h!);

    if (timeFormat === "24h") {
      setSelectedHour(h!);
    } else {
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setSelectedHour(hour12.toString().padStart(2, "0"));
      setSelectedPeriod(hour24 >= 12 ? "PM" : "AM");
    }
    setSelectedMinute(m!);
    updateTime(h!, m!, hour24 >= 12 ? "PM" : "AM");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* FIX: Added w-full to this wrapping div */}
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal transition-all duration-200 hover:bg-accent/50",
              !selectedDate && "text-muted-foreground",
              className,
            )}
            disabled={disabled}
          >
            <div className="flex items-center truncate w-full">
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              {selectedDate ? (
                <div className="flex items-center gap-2 truncate flex-1">
                  <span className="truncate font-medium">
                    {format(selectedDate, "PPP")}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 bg-accent/50 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {format(selectedDate, "HH:mm")}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="flex-1">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        {selectedDate && !disabled && (
          <div
            role="button"
            aria-label="Clear date"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 p-0 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors cursor-pointer"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </div>
        )}
      </div>
      <PopoverContent
        className={cn(
          "p-0 shadow-lg border-0 bg-background/95 backdrop-blur-sm",
          isMobile ? "w-[95vw] max-w-[360px]" : "w-[360px]",
        )}
        align="start"
        side="bottom"
      >
        <div className="relative overflow-hidden">
          {/* Header */}
          <div className="bg-accent/30 px-3 py-2 border-b">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm">
                {step === 1 ? "Select Date" : "Select Time"}
              </h3>
              <span className="text-xs text-muted-foreground">
                Step {step} of 2
              </span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-primary transition-all duration-500 ease-out rounded-full",
                  step === 1 ? "w-1/2" : "w-full",
                )}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {step === 1 && (
              <div className="space-y-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="w-full"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    return checkDate < today;
                  }}
                  classNames={{
                    months: "flex w-full",
                    month: "space-y-2 w-full",
                    caption:
                      "flex justify-center pt-1 relative items-center mb-2",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell:
                      "text-muted-foreground rounded-md w-8 font-normal text-xs flex-1 text-center",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-full p-0 font-normal aria-selected:opacity-100 text-sm hover:bg-accent rounded-md transition-colors",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedDate}
                  className="w-full"
                  size="sm"
                >
                  Continue to Time
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Time</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTimeFormat(timeFormat === "24h" ? "12h" : "24h")
                    }
                    className="text-xs h-6 px-2"
                  >
                    {timeFormat === "24h" ? "12h" : "24h"}
                  </Button>
                </div>

                <div
                  className={cn(
                    "grid gap-2",
                    timeFormat === "24h" ? "grid-cols-2" : "grid-cols-3",
                  )}
                >
                  {/* Hours */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-1.5 text-center text-sm font-medium">
                      {selectedHour}
                    </div>
                    <div className="h-32 overflow-y-auto">
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          className={cn(
                            "w-full py-1.5 text-sm text-center hover:bg-accent transition-colors",
                            selectedHour === hour && "bg-accent font-medium",
                          )}
                          onClick={() => handleHourSelect(hour)}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-1.5 text-center text-sm font-medium">
                      {selectedMinute}
                    </div>
                    <div className="h-32 overflow-y-auto">
                      {minutes.map((minute) => (
                        <button
                          key={minute}
                          className={cn(
                            "w-full py-1.5 text-sm text-center hover:bg-accent transition-colors",
                            selectedMinute === minute &&
                              "bg-accent font-medium",
                          )}
                          onClick={() => handleMinuteSelect(minute)}
                        >
                          {minute}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AM/PM */}
                  {timeFormat === "12h" && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-primary text-primary-foreground p-1.5 text-center text-sm font-medium">
                        {selectedPeriod}
                      </div>
                      <div className="h-32 flex flex-col">
                        {periods.map((period) => (
                          <button
                            key={period}
                            className={cn(
                              "flex-1 py-1.5 text-sm text-center hover:bg-accent transition-colors",
                              selectedPeriod === period &&
                                "bg-accent font-medium",
                            )}
                            onClick={() =>
                              handlePeriodSelect(period as "AM" | "PM")
                            }
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick times */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Quick select
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {["09:00", "12:00", "15:00", "18:00"].map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleQuickTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    size="sm"
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" />
                    Back
                  </Button>
                  <Button
                    onClick={handleApply}
                    className="flex-1"
                    disabled={!selectedDate}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { DateRange as DayPickerRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface SimpleDateRangeDialogProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function SimpleDateRangeDialog({
  value,
  onChange,
}: SimpleDateRangeDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Internal state using day-picker's expected format
  const [range, setRange] = React.useState<DayPickerRange | undefined>({
    from: value.from,
    to: value.to,
  });

  // Sync with parent
  React.useEffect(() => {
    setRange({ from: value.from, to: value.to });
  }, [value]);

  const handleApply = () => {
    onChange({ from: range?.from, to: range?.to });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRange(undefined);
    onChange({ from: undefined, to: undefined });
  };

  const displayValue = range?.from
    ? range.to
      ? `${format(range.from, "MMM d, y")} - ${format(range.to, "MMM d, y")}`
      : format(range.from, "MMM d, y")
    : "Select reporting period";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium h-11 rounded-xl bg-slate-50/50 border-slate-100 transition-all hover:bg-slate-100/50",
            !range?.from && "text-slate-400",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
          <span className="truncate flex-1">{displayValue}</span>
          {range?.from && (
            <X
              className="ml-2 h-3.5 w-3.5 text-slate-400 hover:text-rose-500 transition-colors"
              onClick={handleClear}
            />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px] rounded-[28px] border-none p-0 overflow-hidden shadow-2xl">
        <div className="bg-indigo-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="size-5" /> Reporting Period
            </DialogTitle>
            <DialogDescription className="text-indigo-100/80 font-medium">
              Choose the time frame for your financial report.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center justify-between bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-[11px] font-black uppercase tracking-widest opacity-80">
              Range
            </div>
            <div className="text-sm font-bold tracking-tight">
              {range?.from ? format(range.from, "MMM d") : "..."}
              {range?.to ? ` → ${format(range.to, "MMM d")}` : ""}
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col items-center bg-white">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            disabled={(date) => date > new Date()}
            className="rounded-xl border-none"
          />
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 font-bold shadow-lg shadow-indigo-200"
          >
            <Check className="mr-2 h-4 w-4" /> Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

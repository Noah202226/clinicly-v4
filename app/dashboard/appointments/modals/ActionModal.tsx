"use client";

import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AppointmentDoc from "../types/AppointmentDoc";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDoc | null;
  type: "approved" | "cancelled";
  emailBody: string;
  setEmailBody: (val: string) => void;
  sendEmailChecked: boolean;
  setSendEmailChecked: (val: boolean) => void;
  // Updated to pass back the potentially changed date/time
  onConfirm: (
    type: "approved" | "cancelled",
    date: string,
    time: string,
  ) => void;
  isLoading: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  appointment,
  type,
  emailBody,
  setEmailBody,
  sendEmailChecked,
  setSendEmailChecked,
  onConfirm,
  isLoading,
}: ActionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Sync state when appointment opens
  useEffect(() => {
    if (appointment && isOpen) {
      setSelectedDate(parseISO(appointment.date));
      setSelectedTime(appointment.time);
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const isApproval = type === "approved";

  const handleConfirm = () => {
    if (!selectedDate) return;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    onConfirm(type, formattedDate, selectedTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <span className="text-emerald-600">
                Confirm & Approve Appointment
              </span>
            ) : (
              <span className="text-red-600">Decline Appointment</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Patient Summary */}
          <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-base">
                  {appointment.name}
                </p>
                <p className="text-slate-500">{appointment.serviceName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Current Slot
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {format(parseISO(appointment.date), "MMM d")} @{" "}
                  {appointment.time}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Adjustment - Only really critical for Approval, but kept for flexibility */}
          <div className="space-y-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
            <Label className="text-indigo-900 font-bold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Final Schedule Verification
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500">
                  Date
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500">
                  Time
                </p>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
            </div>
            {selectedDate &&
              (format(selectedDate, "yyyy-MM-dd") !== appointment.date ||
                selectedTime !== appointment.time) && (
                <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Note: You are modifying
                  the original requested time.
                </p>
              )}
          </div>

          {/* Email Body Editor */}
          <div className="space-y-2">
            <Label htmlFor="email-message" className="font-bold text-slate-700">
              Notification Message
            </Label>
            <Textarea
              id="email-message"
              className="h-40 font-mono text-xs bg-white"
              placeholder="Write your message here..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 italic">
              HTML tags are supported for formatting.
            </p>
          </div>

          {/* Email Opt-in */}
          <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
            <Checkbox
              id="send-email"
              checked={sendEmailChecked}
              onCheckedChange={(checked) => setSendEmailChecked(!!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="send-email"
                className="text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Send notification email
              </label>
              <p className="text-xs text-slate-500">
                Patient will receive the message above via {appointment.email}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isApproval ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isLoading || !selectedDate}
            className={cn(
              isApproval ? "bg-indigo-600 hover:bg-indigo-700" : "",
            )}
          >
            {isLoading
              ? "Processing..."
              : isApproval
                ? "Confirm & Approve"
                : "Confirm & Decline"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

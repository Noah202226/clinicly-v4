"use client";

import * as React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Cake, Gift, ChevronRight, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Patient } from "../store/patientStore";

interface BirthdayListProps {
  patients: Patient[];
}

export function BirthdayList({ patients }: BirthdayListProps) {
  const today = new Date();

  const monthlyBirthdays = React.useMemo(() => {
    const currentMonth = today.getMonth();
    return patients
      .filter((p) => {
        if (!p.birthdate) return false;
        const bday = parseISO(p.birthdate);
        return bday.getMonth() === currentMonth;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.birthdate!).getDate();
        const dateB = parseISO(b.birthdate!).getDate();
        return dateA - dateB;
      });
  }, [patients, today]);

  return (
    <div className="divide-y divide-slate-100">
      {monthlyBirthdays.map((patient) => {
        const bdayDate = parseISO(patient.birthdate!);
        const isToday = isSameDay(bdayDate, today);

        return (
          <div
            key={patient.$id}
            className={`group flex items-center justify-between p-4 transition-all duration-200 ${
              isToday
                ? "bg-pink-50/40 border-l-4 border-l-pink-500"
                : "hover:bg-slate-50 border-l-4 border-l-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon Container */}
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:scale-110 ${
                  isToday
                    ? "bg-white border-pink-200 text-pink-500 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {isToday ? (
                  <Cake className="size-5" />
                ) : (
                  <Gift className="size-5" />
                )}
              </div>

              {/* Patient Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold tracking-tight ${isToday ? "text-pink-900" : "text-slate-700"}`}
                  >
                    {patient.firstname} {patient.lastname}
                  </span>
                  {isToday && (
                    <Badge
                      variant="secondary"
                      className="bg-pink-500 text-white hover:bg-pink-600 text-[10px] h-4 px-1.5 border-none font-bold"
                    >
                      TODAY
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {format(bdayDate, "MMMM dd")}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {/* <div className="flex items-center gap-1">
              {isToday && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-pink-500 hover:bg-pink-100 hover:text-pink-600 rounded-full"
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Greeting</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div> */}
          </div>
        );
      })}
    </div>
  );
}

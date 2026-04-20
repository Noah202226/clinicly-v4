"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  IconCalendarEvent,
  IconClock,
  IconUser,
  IconStethoscope,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface TodayAppointmentsModalProps {
  children: React.ReactNode;
  appointments: any[];
}

export function TodayAppointmentsModal({
  children,
  appointments,
}: TodayAppointmentsModalProps) {
  const [open, setOpen] = useState(false);

  // Sort appointments by time
  const sortedAppointments = [...appointments].sort((a, b) =>
    (a.time || "").localeCompare(b.time || ""),
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-blue-600 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <IconCalendarEvent className="size-7" />
                    Today's Schedule
                  </DialogTitle>
                  <DialogDescription className="text-blue-100 font-medium">
                    {appointments.length} patients scheduled for today
                  </DialogDescription>
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white px-3 py-1">
                  Live View
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar bg-white">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium italic">
                No appointments scheduled for today.
              </div>
            ) : (
              sortedAppointments.map((appt) => (
                <div
                  key={appt.$id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconClock className="size-4" />
                      <span className="text-[10px] font-black">
                        {appt.time || "--:--"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none capitalize">
                        {appt.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className="text-[11px] flex items-center gap-1 text-slate-500 font-bold">
                          <IconStethoscope className="size-3 text-blue-400" />
                          {appt.serviceName || "Consultation"}
                        </span>
                        <span className="text-[11px] flex items-center gap-1 text-slate-500 font-bold">
                          <IconUser className="size-3 text-blue-400" />
                          Dr. {appt.dentistName || "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-lg ${
                        appt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : appt.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {appt.status || "Pending"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

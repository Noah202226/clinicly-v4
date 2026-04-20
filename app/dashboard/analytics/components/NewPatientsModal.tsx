"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { IconUserPlus, IconPhone, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";

interface NewPatientsModalProps {
  children: React.ReactNode;
  patients: any[];
}

export function NewPatientsModal({
  children,
  patients,
}: NewPatientsModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Ginagawang clickable ang card trigger */}
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <IconUserPlus className="size-6 text-indigo-600" />
              </div>
              New Patients This Month
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Registered in {format(new Date(), "MMMM yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {patients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium italic">
                No new registrations recorded for this month.
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.$id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {patient.firstname[0]}
                      {patient.lastname[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">
                        {patient.lastname}, {patient.firstname}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] flex items-center gap-1 text-slate-500 font-bold">
                          <IconCalendar className="size-3 text-indigo-400" />
                          {format(
                            new Date(patient.$createdAt),
                            "MMM dd, hh:mm a",
                          )}
                        </span>
                        <span className="text-[11px] flex items-center gap-1 text-slate-500 font-bold">
                          <IconPhone className="size-3 text-indigo-400" />
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Verified
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

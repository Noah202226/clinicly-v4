"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import {
  IconGift,
  IconCake,
  IconMessage,
  IconPhone,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { usePatientStore } from "@/app/store/patientStore";

interface TodayBirthdaysModalProps {
  children: React.ReactNode;
}

export function TodayBirthdaysModal({ children }: TodayBirthdaysModalProps) {
  const [open, setOpen] = useState(false);

  const { patients } = usePatientStore();

  // I-filter ang mga may birthday ngayong araw
  const birthdayCelebrants = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    return patients.filter((p) => {
      if (!p.birthdate) return false;
      const bday = new Date(p.birthdate);
      return bday.getMonth() === currentMonth && bday.getDate() === currentDate;
    });
  }, [patients]);

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-pink-500 p-6 text-white relative">
            <IconCake className="absolute right-4 bottom-2 size-24 opacity-20 rotate-12" />
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <IconGift className="size-7" />
                    Today's Celebrants
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 font-medium">
                    {birthdayCelebrants.length} patients celebrating today!
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar bg-white">
            {birthdayCelebrants.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium italic">
                No patient birthdays recorded for today.
              </div>
            ) : (
              birthdayCelebrants.map((patient) => (
                <div
                  key={patient.$id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm border-2 border-white shadow-sm">
                      {patient.firstname[0]}
                      {patient.lastname[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">
                        {patient.firstname} {patient.lastname}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-bold">
                        {patient.phone || "No phone number"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {patient.phone && (
                      <>
                        <a
                          href={`sms:${patient.phone}?body=Happy Birthday from our Clinic!`}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                          title="Send SMS Greeting"
                        >
                          <IconMessage className="size-5" />
                        </a>
                        <a
                          href={`tel:${patient.phone}`}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Call Patient"
                        >
                          <IconPhone className="size-5" />
                        </a>
                      </>
                    )}
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

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { IconCash, IconReceipt, IconUser } from "@tabler/icons-react";
import { format } from "date-fns";
import { usePatientStore } from "@/app/store/patientStore";

interface TodaySalesModalProps {
  children: React.ReactNode;
  transactions: any[]; // Ito yung transactionsToday mula sa store mo
}

export function TodaySalesModal({
  children,
  transactions,
}: TodaySalesModalProps) {
  const [open, setOpen] = useState(false);

  const { patients } = usePatientStore(); // Kunin ang listahan ng patients mula sa store

  // Helper function para mahanap ang pangalan ng pasyente
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.$id === patientId);
    if (patient) {
      return `${patient.firstname} ${patient.lastname}`;
    }
    return "Walk-in Patient"; // Fallback kung hindi mahanap or kung deleted na
  };

  // Calculate total again just for display safety
  const totalAmount = transactions.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0,
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none">
          <div className="bg-green-600 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <IconCash className="size-7" />
                    Today's Revenue
                  </DialogTitle>
                  <DialogDescription className="text-green-100 font-medium">
                    Breakdown of collections for{" "}
                    {format(new Date(), "MMMM dd, yyyy")}
                  </DialogDescription>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    Total Collected
                  </span>
                  <div className="text-3xl font-black">
                    ₱{totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar bg-white">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium">
                No transactions recorded yet for today.
              </div>
            ) : (
              transactions.map((trx) => (
                <div
                  key={trx.$id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                      <IconReceipt className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">
                        {getPatientName(trx.patientId)}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {trx.serviceType || "Medical Service"} •{" "}
                        {format(new Date(trx.$createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-green-600">
                      + ₱{trx.amount?.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {trx.paymentMethod || "Cash"}
                    </div>
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

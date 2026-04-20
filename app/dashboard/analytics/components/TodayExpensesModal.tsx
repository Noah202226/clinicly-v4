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
  IconTrendingDown,
  IconReceipt2,
  IconToolsKitchen2,
  IconBolt,
  IconPackage,
  IconDots,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface TodayExpensesModalProps {
  children: React.ReactNode;
  expenses: any[];
}

export function TodayExpensesModal({
  children,
  expenses,
}: TodayExpensesModalProps) {
  const [open, setOpen] = useState(false);

  // Helper para sa Dynamic Icons base sa category
  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("supply") || cat.includes("inventory"))
      return <IconPackage className="size-5" />;
    if (
      cat.includes("utility") ||
      cat.includes("bill") ||
      cat.includes("electric")
    )
      return <IconBolt className="size-5" />;
    if (cat.includes("food") || cat.includes("meal"))
      return <IconToolsKitchen2 className="size-5" />;
    return <IconReceipt2 className="size-5" />; // Default icon
  };

  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0,
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-rose-600 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <IconTrendingDown className="size-7" />
                    Daily Expenses
                  </DialogTitle>
                  <DialogDescription className="text-rose-100 font-medium">
                    Operational costs for {format(new Date(), "MMMM dd, yyyy")}
                  </DialogDescription>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    Total Outflow
                  </span>
                  <div className="text-3xl font-black">
                    ₱{totalExpenses.toLocaleString()}
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar bg-white">
            {expenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium italic">
                No expenses recorded for today.
              </div>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp.$id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-sm group-hover:border-rose-200 transition-colors">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">
                        {exp.description || "Unnamed Expense"}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {exp.category || "General"}
                        </span>
                        • {format(new Date(exp.$createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-rose-600 text-lg">
                      - ₱{exp.amount?.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Paid via {exp.paymentMethod || "Cash"}
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

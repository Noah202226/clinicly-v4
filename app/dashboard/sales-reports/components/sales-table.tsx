"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatientStore } from "@/app/store/patientStore";
import { useBranchStore } from "@/app/store/branch-store";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User2, Activity } from "lucide-react";

export function TransactionTable({ transactions }: { transactions: any[] }) {
  const { patientNameMap, fetchPatients } = usePatientStore();
  const { currentBranchId } = useBranchStore();

  React.useEffect(() => {
    if (currentBranchId) {
      fetchPatients(currentBranchId);
    }
  }, [currentBranchId, fetchPatients]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-b border-slate-100">
            <TableHead className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-3.5" /> Date
              </div>
            </TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <User2 className="size-3.5" /> Patient
              </div>
            </TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5" /> Service
              </div>
            </TableHead>
            <TableHead className="text-right py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-slate-400 font-medium italic"
              >
                No transactions found for this period.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow
                key={t.$id}
                className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
              >
                <TableCell className="py-4 px-6 font-medium text-slate-600">
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {patientNameMap[t.patientId] ?? "Unknown Patient"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ID: {t.patientId.slice(-6)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-indigo-50/50 text-indigo-600 border-indigo-100 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-lg"
                  >
                    {t.serviceType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <span className="font-black text-slate-900 text-base">
                    ₱
                    {t.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

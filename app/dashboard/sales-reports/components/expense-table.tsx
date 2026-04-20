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
import { Expense } from "@/app/store/expense-store";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileText, Tag, ArrowDownCircle } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
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
                <FileText className="size-3.5" /> Description
              </div>
            </TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <Tag className="size-3.5" /> Category
              </div>
            </TableHead>
            <TableHead className="text-right py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center justify-end gap-2">
                <ArrowDownCircle className="size-3.5" /> Amount
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!expenses.length ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-slate-400 font-medium italic"
              >
                No expenses found for this period.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((e) => (
              <TableRow
                key={e.$id}
                className="group hover:bg-rose-50/30 transition-colors border-b border-slate-50 last:border-0"
              >
                <TableCell className="py-4 px-6 font-medium text-slate-600">
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <span className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {e.description}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-600 border-slate-200 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-lg"
                  >
                    {e.category || "General"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <span className="font-black text-rose-600 text-base">
                    - ₱
                    {e.amount.toLocaleString(undefined, {
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

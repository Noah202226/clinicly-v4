"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  IconFilter,
  IconReceipt,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import your real transaction store
import { useTransactionStore } from "@/app/store/transaction-store";

export function DentistCommissionTab() {
  const { transactions, loading, fetchAllTransactions } = useTransactionStore();

  // Filters State
  const [selectedDentistFilter, setSelectedDentistFilter] =
    React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  // Fetch data on mount
  React.useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  // Extract unique list of dentists from existing transactions for the filter
  const uniqueDentists = React.useMemo(() => {
    const names = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.dentist && !tx.deleted) names.add(tx.dentist);
    });
    return Array.from(names).sort();
  }, [transactions]);

  // Filter Logic: Dentist + Date Range + Exclude Deleted
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      const isNotDeleted = !tx.deleted;
      const matchDentist =
        selectedDentistFilter === "all" || tx.dentist === selectedDentistFilter;

      // Handle date filtering (Appwrite dates are usually ISO strings)
      const txDate = tx.date ? tx.date.split("T")[0] : "";
      const matchStart = !startDate || txDate >= startDate;
      const matchEnd = !endDate || txDate <= endDate;

      return isNotDeleted && matchDentist && matchStart && matchEnd;
    });
  }, [transactions, selectedDentistFilter, startDate, endDate]);

  // Calculate totals from the "commission" field in your Appwrite schema
  // Note: Based on your CreateTransactionInput, the field name is likely 'commission'
  const totalFilteredCommission = filteredTransactions.reduce(
    (sum, t) => sum + (Number((t as any).commission) || 0),
    0,
  );

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconReceipt className="h-5 w-5" /> Commission Ledger
              </CardTitle>
              <CardDescription>
                Real-time transaction tracking from Appwrite. Filter by date and
                dentist.
              </CardDescription>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse text-sm">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Syncing with Appwrite...
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <IconFilter className="h-3 w-3" /> Dentist
              </Label>
              <Select
                value={selectedDentistFilter}
                onValueChange={setSelectedDentistFilter}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Dentists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dentists</SelectItem>
                  {uniqueDentists.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <IconCalendar className="h-3 w-3" /> Start Date
              </Label>
              <Input
                type="date"
                className="bg-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <IconCalendar className="h-3 w-3" /> End Date
              </Label>
              <Input
                type="date"
                className="bg-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Banner */}
          <div className="mb-6 flex items-center justify-between bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <div>
              <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">
                Volume
              </p>
              <p className="text-2xl font-black text-indigo-900">
                {filteredTransactions.length}{" "}
                <span className="text-sm font-medium">Txns</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-semibold uppercase tracking-wider">
                Total Earnings
              </p>
              <p className="text-2xl font-black text-green-700">
                ₱{totalFilteredCommission.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Net Price</TableHead>
                  <TableHead className="text-right text-green-600 font-bold">
                    Commission
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.$id} className="hover:bg-slate-50/50">
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{tx.dentist}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {tx.serviceName}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {tx.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border text-slate-600">
                        {tx.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ₱{tx.amount?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 tabular-nums">
                      ₱{(tx as any).commission?.toLocaleString() || "0"}
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No real transactions found for this selection.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

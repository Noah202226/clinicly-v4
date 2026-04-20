"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/app/store/patientStore";
import {
  useTransactionStore,
  Transaction,
} from "@/app/store/transaction-store";
import {
  Search,
  ArrowLeft,
  ReceiptText,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PendingBalancesModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const { patients } = usePatientStore();
  // Added fetchTransactions and loading from your store
  const { transactions, fetchAllTransactions, loading } = useTransactionStore();
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // 🔵 1. Fetch transactions whenever the modal opens
  // This ensures the global 'transactions' list is populated
  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  // 2. Filter patients who owe money
  const debtors = (patients as any[]).filter((p) => {
    const hasBalance = p.remainingBal > 0;
    const matchesSearch = `${p.firstname} ${p.lastname}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return hasBalance && matchesSearch;
  });

  // 3. Identify the selected patient
  const selectedPatient = (patients as any[]).find(
    (p) => p.$id === selectedPatientId,
  );

  // 🔵 4. Filter transactions for the SPECIFIC selected patient
  // We use useMemo to re-run this logic EVERY time selectedPatientId or transactions change
  const patientTransactions = useMemo<Transaction[]>(() => {
    if (!selectedPatientId) return [];

    return transactions
      .filter((t) => {
        // Ensure we match the ID correctly (handling potential object IDs vs strings)
        const tId =
          typeof t.patientId === "object"
            ? (t.patientId as any)?.$id
            : t.patientId;

        // 👇 YOU ARE MISSING THIS LINE 👇
        return tId === selectedPatientId && t.remainingBal > 0;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedPatientId]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setSelectedPatientId(null);
          setSearch("");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            {selectedPatientId ? (
              <button
                onClick={() => setSelectedPatientId(null)}
                className="hover:bg-slate-100 p-1 rounded-full transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : null}
            {selectedPatientId
              ? "Transaction History"
              : "Patients with Pending Balances"}
          </DialogTitle>
          {selectedPatient && (
            <p className="text-sm text-muted-foreground ml-9">
              Viewing records for{" "}
              <span className="font-bold text-slate-900">
                {selectedPatient.firstname} {selectedPatient.lastname}
              </span>
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2">
          {!selectedPatientId ? (
            /* --- VIEW 1: LIST OF DEBTORS --- */
            <>
              <div className="relative my-4">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient name..."
                  className="pl-10 h-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/30">
                {loading && debtors.length === 0 ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : debtors.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No pending balances found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {debtors.map((p) => (
                      <div
                        key={p.$id}
                        onClick={() => setSelectedPatientId(p.$id)}
                        className="p-4 flex items-center justify-between hover:bg-white hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            {p.lastname[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {p.lastname}, {p.firstname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.phone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Balance
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            ₱{((p as any).remainingBal || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* --- VIEW 2: PATIENT TRANSACTION DETAILS --- */
            <div className="space-y-4 overflow-y-auto pr-1">
              {loading ? (
                <div className="p-12 flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-500 size-8" />
                  <p className="text-sm text-slate-500">
                    Loading transactions...
                  </p>
                </div>
              ) : patientTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <ReceiptText className="size-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">
                    No pending transactions found for this patient.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setSelectedPatientId(null)}
                  >
                    Go back
                  </Button>
                </div>
              ) : (
                patientTransactions.map((tx) => (
                  <div
                    key={tx.$id}
                    className="border rounded-xl p-4 bg-white shadow-sm border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-600">
                          <ReceiptText className="size-4" />
                          <span className="font-bold text-sm uppercase">
                            {tx.serviceType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                        Pending: ₱{tx.remainingBal.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Service Price
                        </p>
                        <p className="text-sm font-semibold">
                          ₱{tx.servicePrice?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Paid Today
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          ₱{tx.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Dentist
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {tx.dentist || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

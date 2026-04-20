"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/app/store/transaction-store";
import { useServiceStore } from "@/app/store/service-store";

import NewTransactionModal from "./NewTransactionModal";
import InstallmentModal from "./InstallmentModal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  FileText,
  Receipt,
  Trash2,
  Plus,
  Loader2,
  Info,
  Banknote,
} from "lucide-react";
import { usePatientStore } from "@/app/store/patientStore";
import { format } from "date-fns";

interface PatientTransactionsProps {
  patient: any;
}

export default function PatientTransactions({
  patient,
}: PatientTransactionsProps) {
  const {
    fetchTransactionsByPatient,
    transactions,
    softDeleteTransaction,
    loading,
  } = useTransactionStore();
  const { fetchServices } = useServiceStore();
  const { fetchPatientById, selectedPatient } = usePatientStore();

  const [newTxOpen, setNewTxOpen] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openInstallmentTxId, setOpenInstallmentTxId] = useState<string | null>(
    null,
  );
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (patient?.$id) {
      fetchServices();
      fetchTransactionsByPatient(patient.$id);
      fetchPatientById(patient.$id);
    }
  }, [
    patient?.$id,
    fetchServices,
    fetchTransactionsByPatient,
    fetchPatientById,
  ]);

  const patientTransactions = useMemo(
    () => transactions.filter((t) => t.patientId === patient?.$id),
    [transactions, patient?.$id],
  );

  const transactionToEdit = useMemo(
    () => patientTransactions.find((t) => t.$id === selectedTransactionId),
    [patientTransactions, selectedTransactionId],
  );

  if (!patient) return null;

  return (
    <div className="flex flex-col space-y-6">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Ledger & Notes
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            History of services and payment plans
          </p>
        </div>
        <Button
          onClick={() => setNewTxOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 rounded-xl h-11 px-6 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Record
        </Button>
      </div>

      {/* TRANSACTION LIST */}
      <div className="overflow-hidden rounded-2xl bg-white border shadow-sm">
        {/* Table Header (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Procedure & Category</div>
          <div className="col-span-2">Dentist</div>
          <div className="col-span-2 text-right">Paid</div>
          <div className="col-span-1 text-right">Balance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">
              Syncing transactions...
            </p>
          </div>
        ) : patientTransactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              No transaction records found for this patient.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patientTransactions
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map((tx) => {
                const isInstallment = tx.paymentMode === "Installment";
                const hasBalance = Number(tx.remainingBal) > 0;

                return (
                  <div
                    key={tx.$id}
                    className="group relative flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center gap-4 lg:gap-0 px-5 py-5 lg:px-6 lg:py-4 hover:bg-slate-50/50 transition-all cursor-pointer"
                    onClick={() => setSelectedTransactionId(tx.$id)}
                  >
                    {/* Date (Responsive Layout) */}
                    <div className="col-span-2 flex flex-row lg:flex-col items-baseline lg:items-start gap-2 lg:gap-0">
                      <span className="text-sm font-bold text-slate-700">
                        {format(new Date(tx.date), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 uppercase">
                        {format(new Date(tx.date), "eeee")}
                      </span>
                    </div>

                    {/* Procedure & Info */}
                    <div className="col-span-3 flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-1 ${isInstallment ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                      >
                        {isInstallment ? (
                          <Receipt size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate leading-tight mb-1">
                          {tx.serviceName || "General Procedure"}
                        </span>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                            {tx.category || "General"}
                          </span>
                          {tx.notes && (
                            <span className="text-[11px] text-slate-400 italic truncate max-w-[120px]">
                              — {tx.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dentist (Hidden on very small screens, visible on LG) */}
                    <div className="col-span-2 lg:flex items-center gap-2 hidden">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {tx.dentist?.charAt(0) || "D"}
                      </div>
                      <span className="text-xs font-medium text-slate-600 truncate">
                        {tx.dentist || "Not Assigned"}
                      </span>
                    </div>

                    {/* Pricing (Side-by-side on mobile, grid on desktop) */}
                    <div className="flex items-center justify-between w-full lg:w-auto lg:col-span-2 lg:justify-end gap-2 border-t pt-3 lg:border-0 lg:pt-0">
                      <div className="flex flex-col lg:items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase lg:hidden">
                          Paid
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                          ₱{Number(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end lg:col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase lg:hidden">
                        Balance
                      </span>
                      <span
                        className={`text-sm font-black ${hasBalance ? "text-orange-500" : "text-slate-300"}`}
                      >
                        ₱{Number(tx.remainingBal).toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end w-full lg:w-auto gap-2">
                      {isInstallment && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 px-3 text-blue-700 bg-blue-50 hover:bg-blue-100 border-none rounded-lg font-bold text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenInstallmentTxId(tx.$id);
                          }}
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1.5" />
                          Installments
                        </Button>
                      )}
                      <button
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTxId(tx.$id);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* SUMMARY BAR - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Visit Count
          </span>
          <span className="text-2xl font-black text-slate-900">
            {patientTransactions.length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
            Total Collections
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-500">₱</span>
            <span className="text-2xl font-black text-emerald-600">
              {patientTransactions
                .reduce((sum, t) => sum + (t.amount || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm border-orange-100">
          <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider block mb-1">
            Outstanding Balance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-orange-500">₱</span>
            <span className="text-2xl font-black text-orange-600">
              {selectedPatient?.remainingBal?.toLocaleString() ?? "0"}
            </span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <NewTransactionModal
        open={newTxOpen || !!selectedTransactionId}
        onOpenChange={(open) => {
          if (!open) {
            setNewTxOpen(false);
            setSelectedTransactionId(null);
          }
        }}
        patient={patient}
        transaction={transactionToEdit}
      />

      <InstallmentModal
        open={Boolean(openInstallmentTxId)}
        onOpenChange={() => setOpenInstallmentTxId(null)}
        transaction={
          patientTransactions.find((t) => t.$id === openInstallmentTxId) || null
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTxId)}
        title="Delete Transaction"
        message="This will also delete all installments for this transaction. This action cannot be undone."
        loading={isDeleting}
        onCancel={() => setDeleteTxId(null)}
        onConfirm={async () => {
          if (!deleteTxId) return;
          setIsDeleting(true);
          await softDeleteTransaction(deleteTxId);
          await fetchTransactionsByPatient(patient.$id);
          setIsDeleting(false);
          setDeleteTxId(null);
        }}
      />
    </div>
  );
}

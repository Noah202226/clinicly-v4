"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useInstallmentsStore } from "@/app/store/installments-store";
import { useTransactionStore } from "@/app/store/transaction-store";
import ConfirmDialog from "@/app/components/ConfirmDialog";

import {
  Trash2,
  Receipt,
  FileText,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

import { Transaction } from "@/app/store/transaction-store";
import { usePatientStore } from "@/app/store/patientStore";
import { useBranchStore } from "@/app/store/branch-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export default function InstallmentModal({
  open,
  onOpenChange,
  transaction,
}: Props) {
  const {
    installments,
    fetchInstallments,
    addInstallment,
    loading,
    deleteInstallment,
  } = useInstallmentsStore();

  const { currentBranchId } = useBranchStore();
  const { fetchTransactionsByPatient, fetchAllTransactions } =
    useTransactionStore();
  const { selectedPatient, fetchPatientById } = usePatientStore();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);

  const [datePaid, setDatePaid] = useState(
    new Date().toISOString().split("T")[0], // default: today YYYY-MM-DD
  );

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  useEffect(() => {
    if (open && transaction?.$id) {
      fetchInstallments(transaction.$id);
    }
  }, [open, transaction]);

  const handleAdd = async () => {
    if (!transaction?.$id) return;
    if (!amount || Number(amount) <= 0) return alert("Invalid amount");

    await addInstallment(
      transaction.$id,
      Number(amount),
      note,
      datePaid,
      "system",
      currentBranchId || "",
    );

    if (selectedPatient) {
      const currentBal = Number(selectedPatient.remainingBal);
      const newBal = Math.max(0, currentBal - Number(amount));

      // This updates Appwrite AND the Zustand state globally
      await usePatientStore.getState().updatePatient(selectedPatient.$id, {
        remainingBal: newBal,
      });

      fetchTransactionsByPatient(selectedPatient.$id);
      fetchPatientById(selectedPatient.$id);
      fetchInstallments(transaction.$id);
      setAmount("");
      setNote("");
    }
  };

  const handleDelete = async (installmentId: string, instAmount: number) => {
    if (!transaction?.$id || !selectedPatient) return;

    // 1. Delete the record
    await deleteInstallment(installmentId, transaction.$id);

    // 2. Add the amount back to the patient balance
    const currentBal = Number(selectedPatient.remainingBal || 0);
    const newBal = currentBal + Number(instAmount);

    await usePatientStore.getState().updatePatient(selectedPatient.$id, {
      remainingBal: newBal,
    });

    // 3. Refresh UI
    fetchTransactionsByPatient(selectedPatient.$id);
    fetchInstallments(transaction.$id);
    fetchPatientById(selectedPatient.$id);
  };

  // compute total paid
  const totalPaid = installments.reduce(
    (s, it) => s + Number(it.amount || 0),
    0,
  );
  const servicePrice = (transaction?.remainingBal ?? 0) + totalPaid;
  const isCompleted = (transaction?.remainingBal ?? 0) <= 0;

  // const remaining = transaction.totalAmount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Installment Payments
          </DialogTitle>
        </DialogHeader>

        {/* --- Summary bar --- */}
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex justify-between items-center border-b-3">
            <div>
              <div className="text-sm text-gray-600">Service Name</div>
              <div className="text-lg font-semibold">
                {transaction?.serviceType}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Price:</div>
              {/* If you have parent transaction remaining, show it, else hide */}
              <div className="text-lg font-semibold text-red-600">
                ₱{Number(servicePrice ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Total Paid</div>
              <div className="text-lg font-semibold">
                ₱{Number(totalPaid).toLocaleString()}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Remaining</div>
              {/* If you have parent transaction remaining, show it, else hide */}
              {/* <div className="text-lg font-semibold text-red-600">
                ₱{Number(transaction?.remainingBal ?? 0).toLocaleString()}
              </div> */}

              <div>
                {isCompleted
                  ? "PAID"
                  : `₱${(transaction?.remainingBal ?? 0).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* Installments List */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
          {installments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No payments yet.
            </p>
          ) : (
            installments.map((it) => {
              const isOpen = openId === it.$id;
              return (
                <motion.div
                  key={it.$id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="bg-white border rounded-lg shadow-sm"
                >
                  {/* Row top */}
                  <div className="p-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        ₱{Number(it.amount).toLocaleString()}
                      </div>
                      {it.note && (
                        <div className="text-xs text-gray-600 mt-1">
                          {it.note}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">
                        {new Date(it.datePaid).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          aria-label="toggle details"
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => toggle(it.$id)}
                        >
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          aria-label="delete installment"
                          className="text-red-600 text-xs hover:text-red-800"
                          onClick={() => {
                            if (
                              typeof it.$id === "string" &&
                              typeof transaction?.$id === "string" &&
                              confirm("Deltee this installment?")
                            ) {
                              handleDelete(it.$id, it.amount);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible content: animate height for smooth slide */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={
                      isOpen
                        ? { height: "auto", opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="p-3 border-t bg-gray-50">
                      <div className="text-sm text-gray-700">
                        <strong>Details:</strong>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Payment type: {it.createdBy ?? "—"} {/* optional */}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Note: {it.note || "—"}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={Boolean(deleteId)}
          title="Delete Installment"
          message="Are you sure you want to remove this payment?"
          loading={isDeleting}
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            if (!deleteId) return;
            setIsDeleting(true);
            await deleteInstallment(deleteId, transaction?.$id ?? "");
            setIsDeleting(false);
            setDeleteId(null);
          }}
        />

        {/* Add New Payment */}
        {!isCompleted && (
          <div className="space-y-3 mt-3">
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />

            <Input
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full"
            />

            <Textarea
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />

            <Button
              disabled={loading}
              onClick={handleAdd}
              className="w-full font-semibold"
            >
              {loading ? "Saving..." : "Add Payment"}
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="text-center p-2 rounded-md bg-green-50 text-green-700 font-medium mb-3">
            ✔ Fully Paid
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

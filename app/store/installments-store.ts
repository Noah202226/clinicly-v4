"use client";

import { create } from "zustand";
import { ID, Query } from "appwrite";
import {
  databases,
  DATABASE_ID,
  INSTALLMENTS_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
} from "@/app/appwrite";
import { useTransactionStore } from "./transaction-store";
import { toast } from "sonner";

export interface Installment {
  $id: string;
  transactionId: string;
  amount: number;
  note?: string;
  datePaid: string;
  branchId: string;
  createdBy: string;
  $createdAt: string;
}

export interface InstallmentsStoreState {
  installments: Installment[];
  loading: boolean;

  fetchInstallments: (transactionId: string) => Promise<void>;
  addInstallment: (
    transactionId: string,
    amount: number,
    note: string,
    datePaid: string,
    createdBy: string,
    branchId: string,
  ) => Promise<void>;
  deleteInstallment: (
    installmentId: string,
    transactionId: string,
  ) => Promise<void>;
}

export const useInstallmentsStore = create<InstallmentsStoreState>(
  (set, get) => ({
    installments: [],
    loading: false,

    // Fetch installments for a transaction
    fetchInstallments: async (transactionId: string) => {
      set({ loading: true });

      const res = await databases.listDocuments(
        DATABASE_ID,
        INSTALLMENTS_COLLECTION_ID,
        [
          Query.equal("transactionId", transactionId),
          Query.orderDesc("datePaid"),
        ],
      );

      set({ installments: res.documents as any, loading: false });
    },

    // Add installment & update remaining balance
    addInstallment: async (
      transactionId,
      amount,
      note,
      datePaid,
      createdBy,
      branchId,
    ) => {
      set({ loading: true });

      // Generate new ID first
      const newId = ID.unique();

      // 1) Create installment record
      await databases.createDocument(
        DATABASE_ID,
        INSTALLMENTS_COLLECTION_ID,
        newId,
        {
          transactionId,
          amount,
          note,
          datePaid: new Date().toISOString(),
          createdBy,
        },
      );

      // 2) Fetch current transaction to compute new remaining balance
      const tx = await databases.getDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
      );

      const newRemaining = Math.max(0, (tx.remainingBal || 0) - amount);

      // 3) Update transaction remaining balance
      await databases.updateDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
        {
          remainingBal: newRemaining,
        },
      );

      // 4) Refresh local store

      set({
        installments: [
          {
            $id: newId,
            transactionId,
            amount,
            note,
            datePaid,
            createdBy,
            branchId,
            $createdAt: new Date().toISOString(),
          },
          ...get().installments,
        ],
      });

      set({ loading: false });
    },

    // DELETE INSTALLMENT
    deleteInstallment: async (installmentId: string, transactionId: string) => {
      set({ loading: true });

      await databases.deleteDocument(
        DATABASE_ID,
        INSTALLMENTS_COLLECTION_ID,
        installmentId,
      );

      // Refresh updated installments
      const { fetchInstallments } = get();
      await fetchInstallments(transactionId);

      // --- Recalculate totals ---
      const updatedList = get().installments;
      const totalPaid = updatedList.reduce(
        (sum, it) => sum + Number(it.amount || 0),
        0,
      );

      // Update transaction.remainingBal
      const { updateTransactionRemaining } = useTransactionStore.getState();
      await updateTransactionRemaining(transactionId, totalPaid);

      toast.success("installment pay deleted");
      // Remove from local store
      //   set({
      //     installments: get().installments.filter((i) => i.$id !== installmentId),
      //     loading: false,
      //   });
    },
  }),
);

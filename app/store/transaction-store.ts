import { create } from "zustand";
import { ID, Query } from "appwrite";
import {
  databases,
  DATABASE_ID,
  INSTALLMENTS_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
} from "@/app/appwrite";

// ---- TYPES ----
export interface Transaction {
  $id: string;
  patientId: string;
  amount: number;
  serviceType: string;
  paymentMethod: "Full" | "Installment";
  paymentMode: string;
  isInstallment: boolean;
  remainingBal: number;
  receiptNo?: string;
  notes?: string;
  date: string;
  deleted?: boolean;
  servicePrice: number;
  serviceName: string;
  category: string;
  dentist: string;
  branch: string;
}

export type CreateTransactionInput = {
  patientId: string;
  amount: number;
  serviceType: string;
  paymentMode: "Full" | "Installment";
  paymentMethod: string;
  discount: number;
  netPrice: number;
  isInstallment: boolean;
  remainingBal: number;
  commissionPercent: number;
  commission: number;
  notes?: string;
  receiptNo?: string;
  deleted?: boolean;
  date?: string;
  servicePrice: number;
  dentist: string;
  branch: string;
};

export interface TransactionStoreState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  fetchAllTransactions: () => Promise<void>;
  fetchTransactionsByPatient: (patientId: string) => Promise<Transaction[]>;

  createTransaction: (
    data: CreateTransactionInput,
  ) => Promise<Transaction | null>;

  updateTransactionRemaining: (
    transactionId: string,
    totalPaid: number,
  ) => Promise<Transaction | null>;

  updateTransaction: (
    id: string,
    data: Partial<CreateTransactionInput>,
  ) => Promise<Transaction | null>;

  softDeleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStoreState>(
  (set, get) => ({
    transactions: [],
    loading: false,
    error: null,

    fetchAllTransactions: async () => {
      try {
        set({ loading: true, error: null });

        const res = await databases.listDocuments(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          [Query.orderDesc("date"), Query.limit(5000)],
        );

        set({
          transactions: res.documents as unknown as Transaction[],
          loading: false,
        });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    fetchTransactionsByPatient: async (patientId: string) => {
      try {
        set({ loading: true });

        const res = await databases.listDocuments(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          [
            Query.equal("patientId", patientId),
            Query.equal("deleted", false),
            Query.orderDesc("date"),
            Query.limit(5000),
          ],
        );

        const docs = res.documents as unknown as Transaction[];

        set({ transactions: docs });

        return docs;
      } catch (err) {
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    createTransaction: async (data) => {
      try {
        set({ loading: true, error: null });

        // STEP 1 — Create the main transaction
        const createdTx = await databases.createDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          ID.unique(),
          {
            ...data,
            date: data.date ?? new Date().toISOString(),

            deleted: false,
          },
        );

        const tx = createdTx as unknown as Transaction;

        // STEP 2 — If this transaction is installment type,
        // create an installment history entry
        if (tx.isInstallment) {
          await databases.createDocument(
            DATABASE_ID,
            INSTALLMENTS_COLLECTION_ID,
            ID.unique(),
            {
              transactionId: tx.$id,
              amount: tx.amount, // initial payment
              note: "Initial payment",
              datePaid: tx.date,
              createdBy: "system", // or userId if available
            },
          );
        }

        // Update local store
        set({
          transactions: [tx, ...get().transactions],
        });

        return tx;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateTransactionRemaining: async (
      transactionId: string,
      totalPaid: number,
    ) => {
      const tx = get().transactions.find((t) => t.$id === transactionId);
      if (!tx) return null;

      // const price = tx.servicePrice + tx.remainingBal;
      const remaining = tx.servicePrice - totalPaid;

      await databases.updateDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
        { remainingBal: remaining },
      );

      //   Refresh UI
      await get().fetchTransactionsByPatient(tx.patientId);
      return { ...tx, remainingBal: remaining };
    },

    updateTransaction: async (id, data) => {
      try {
        set({ loading: true, error: null });

        // 1. Update the document in Appwrite
        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          id,
          data,
        );

        const updatedTx = updatedDoc as unknown as Transaction;

        // 2. Sync with Installments collection if amount/date changed
        // We look for the "Initial payment" entry for this transaction
        if (updatedTx.isInstallment) {
          try {
            const installmentRes = await databases.listDocuments(
              DATABASE_ID,
              INSTALLMENTS_COLLECTION_ID,
              [
                Query.equal("transactionId", id),
                Query.equal("note", "Initial payment"), // Target the system-created one
              ],
            );

            if (installmentRes.documents.length > 0) {
              const firstInstallment = installmentRes.documents[0];
              await databases.updateDocument(
                DATABASE_ID,
                INSTALLMENTS_COLLECTION_ID,
                firstInstallment.$id,
                {
                  amount: updatedTx.amount,
                  datePaid: updatedTx.date,
                },
              );
            }
          } catch (syncErr) {
            console.error("Failed to sync installment record:", syncErr);
            // We don't throw here so the main transaction update still succeeds in the UI
          }
        }

        // 3. Update local state
        set({
          transactions: get().transactions.map((t) =>
            t.$id === id ? updatedTx : t,
          ),
        });

        return updatedTx;
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    softDeleteTransaction: async (id: string) => {
      try {
        set({ loading: true });

        // 1) Fetch the transaction
        const tx = await databases.getDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          id,
        );

        // 2) Soft delete the transaction
        await databases.updateDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          id,
          { deleted: true },
        );

        // 3) If installment type → delete all installments linked to it
        if (tx.paymentMethod === "Installment") {
          const installments = await databases.listDocuments(
            DATABASE_ID,
            INSTALLMENTS_COLLECTION_ID,
            [Query.equal("transactionId", id)],
          );

          // Delete all installments in this transaction
          for (const inst of installments.documents) {
            await databases.deleteDocument(
              DATABASE_ID,
              INSTALLMENTS_COLLECTION_ID,
              inst.$id,
            );
          }
        }

        // 4) Update local transaction store
        set({
          transactions: get().transactions.map((t) =>
            t.$id === id ? { ...t, deleted: true } : t,
          ),
        });
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      } finally {
        set({ loading: false });
      }
    },
  }),
);

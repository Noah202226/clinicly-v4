import { create } from "zustand";
import { ID, Query } from "appwrite";
import { databases } from "@/app/appwrite";
import { DATABASE_ID, EXPENSE_COLLECTION_ID } from "@/app/appwrite";
import toast from "react-hot-toast";

/* =========================
   TYPES
========================= */
export interface Expense {
  $id: string;
  amount: number;
  category: string;
  reference?: string; // inventoryId / movementId
  date: string; // YYYY-MM-DD
  description: string;
  branchId: string;
  createdBy: string;
}

interface ExpenseFilters {
  from?: string;
  to?: string;
  category?: string;
  branchId?: string;
}

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;

  // Fetchers
  fetchTodayExpenses: (branchId: string) => Promise<void>;
  fetchExpenses: (filters?: ExpenseFilters) => Promise<void>;

  // Mutations
  addExpense: (data: Omit<Expense, "$id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

/* =========================
   STORE
========================= */
export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,

  /* -------------------------
     FETCH TODAY EXPENSES
  ------------------------- */
  fetchTodayExpenses: async (branchId: string) => {
    if (!branchId) {
      console.log("No selected branch");
      toast.error("No selected branch");
    }
    set({ loading: true });

    try {
      const today = new Date().toISOString().slice(0, 10);

      const res = await databases.listDocuments(
        DATABASE_ID,
        EXPENSE_COLLECTION_ID,
        [
          Query.equal("date", today),
          Query.orderDesc("$createdAt"),
          Query.equal("branchId", branchId),
        ],
      );

      set({ expenses: res.documents as unknown as Expense[] });
    } finally {
      set({ loading: false });
    }
  },

  /* -------------------------
     FETCH EXPENSES (FILTERABLE)
  ------------------------- */
  fetchExpenses: async (filters: ExpenseFilters = {}) => {
    if (filters.branchId) {
      console.log("No selected branch");
      toast.error("No selected branch");
    }

    set({ loading: true });

    try {
      const queries = [
        Query.equal("branchId", filters.branchId || ""),
        Query.orderDesc("date"),
      ];

      if (filters.from) {
        queries.push(Query.greaterThanEqual("date", filters.from));
      }

      if (filters.to) {
        queries.push(Query.lessThanEqual("date", filters.to));
      }

      if (filters.category) {
        queries.push(Query.equal("category", filters.category));
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        EXPENSE_COLLECTION_ID,
        queries,
      );

      set({ expenses: res.documents as unknown as Expense[] });
    } finally {
      set({ loading: false });
    }
  },

  /* -------------------------
     ADD EXPENSE
  ------------------------- */
  addExpense: async (data) => {
    await databases.createDocument(
      DATABASE_ID,
      EXPENSE_COLLECTION_ID,
      ID.unique(),
      data,
    );

    // Optimistic refresh (today + expenses page friendly)
    const { fetchExpenses } = get();
    fetchExpenses({});
  },

  /* -------------------------
     DELETE EXPENSE
  ------------------------- */
  deleteExpense: async (id) => {
    await databases.deleteDocument(DATABASE_ID, EXPENSE_COLLECTION_ID, id);

    set({
      expenses: get().expenses.filter((e) => e.$id !== id),
    });
  },
}));

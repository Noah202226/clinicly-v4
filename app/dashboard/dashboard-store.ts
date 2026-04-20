"use client";

import { create } from "zustand";
import { databases, DATABASE_ID } from "@/app/appwrite";
import { Query } from "appwrite";

const APPOINTMENTS = "appointments";
const TRANSACTIONS = "transactions";
const EXPENSES = "expenses";
const INVENTORY = "inventories";

const todayKey = () => new Date().toISOString().slice(0, 10);

interface DashboardState {
  loading: boolean;

  appointmentsToday: number;
  appointmentsListToday: any[];

  remindersToday: number;
  totalSalesToday: number;
  transactionsToday: any[];
  expensesToday: number;
  expensesListToday: any[];
  lowStockCount: number;
  lowStockList: any[]; // Added list for more detail
  outOfStockCount: number; // Added count
  outOfStockList: any[]; // Added list

  fetchTodaySummary: (branchId: string) => Promise<void>; // <-- Added parameter
}

export const useDashboardStore = create<DashboardState>((set) => ({
  loading: false,

  appointmentsToday: 0,
  appointmentsListToday: [],
  remindersToday: 0,
  totalSalesToday: 0,
  transactionsToday: [],
  expensesToday: 0,
  expensesListToday: [],
  lowStockCount: 0,
  lowStockList: [],
  outOfStockCount: 0,
  outOfStockList: [],

  fetchTodaySummary: async (branchId: string) => {
    // Prevent fetching if no branch is selected
    if (!branchId) return;

    set({ loading: true });

    const today = todayKey();

    try {
      const [appts, sales, expenses, inventory] = await Promise.all([
        databases.listDocuments(DATABASE_ID, APPOINTMENTS, [
          Query.equal("branchId", branchId), // <-- Filter by branch
          Query.equal("dateKey", today),
          Query.limit(5000),
        ]),

        databases.listDocuments(DATABASE_ID, TRANSACTIONS, [
          // <-- Filter by branch
          Query.equal("branch", branchId),
          Query.equal("date", today),
          Query.limit(5000),
        ]),

        databases.listDocuments(DATABASE_ID, EXPENSES, [
          // <-- Filter by branch
          Query.equal("branchId", branchId),
          Query.equal("date", today),
          Query.limit(5000),
        ]),

        databases.listDocuments(DATABASE_ID, INVENTORY, [
          Query.equal("branchId", branchId), // <-- Filter by branch
          Query.limit(5000),
        ]),
      ]);

      // 1. Filter for Out of Stock (Quantity is 0 or less)
      const outOfStockItems = inventory.documents.filter(
        (i: any) => i.quantity <= 0,
      );

      // 2. Filter for Low Stock (Quantity is above 0 BUT below/equal to minStock)
      const lowStockItems = inventory.documents.filter(
        (i: any) => i.quantity > 0 && i.quantity <= i.minStock,
      );

      set({
        appointmentsToday: appts.total,
        appointmentsListToday: appts.documents,
        remindersToday: appts.documents.filter((a: any) => a.reminder === true)
          .length,

        totalSalesToday: sales.documents.reduce(
          (sum: number, t: any) => sum + (t.amount || 0),
          0,
        ),

        transactionsToday: sales.documents,
        expensesListToday: expenses.documents,

        expensesToday: expenses.documents.reduce(
          (sum: number, e: any) => sum + (e.amount || 0),
          0,
        ),

        lowStockCount: lowStockItems.length,
        lowStockList: lowStockItems,
        outOfStockCount: outOfStockItems.length,
        outOfStockList: outOfStockItems,
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

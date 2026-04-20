import { create } from "zustand";
import { ID, Query } from "appwrite";
import { databases } from "@/app/appwrite";
import {
  DATABASE_ID,
  INVENTORY_COLLECTION_ID,
  INVENTORY_MOVEMENTS_COLLECTION_ID,
  EXPENSE_COLLECTION_ID,
} from "@/app/appwrite";

export interface InventoryItem {
  $id: string;
  name: string;
  category: string;
  quantity: number;
  // unitPrice: number;
  minStock: number;
  updatedAt?: string;
  branchId?: string;
}

interface UpdateStockParams {
  inventoryId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  createdBy: string;
  isLowStock: boolean;
  newQuantity: number;
}

interface InventoryStore {
  items: InventoryItem[];
  loading: boolean;

  fetchInventory: () => Promise<void>;
  fetchInventoryByBranch: (branchId: string) => Promise<void>;
  addProduct: (data: Omit<InventoryItem, "$id">) => Promise<void>;
  updateStock: (params: UpdateStockParams) => Promise<void>;
  // New delete function added
  deleteProduct: (id: string) => Promise<void>;

  lowStockItems: () => InventoryItem[];
  // totalStockValue: () => number;

  updateMinStock: (id: string, minStock: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  loading: false,

  fetchInventory: async () => {
    set({ loading: true });
    const res = await databases.listDocuments(
      DATABASE_ID,
      INVENTORY_COLLECTION_ID,
      [Query.orderDesc("$updatedAt"), Query.limit(5000)],
    );
    set({ items: res.documents as unknown as InventoryItem[], loading: false });
  },

  fetchInventoryByBranch: async (branchId: string) => {
    if (!branchId) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID, // replace with your actual DB ID variable
        INVENTORY_COLLECTION_ID, // replace with actual collection ID variable
        [
          Query.equal("branchId", branchId), // <-- THIS IS THE MAGIC LINE
          Query.orderDesc("$createdAt"),
          Query.limit(5000), // Optional: sorts by newest first
        ],
      );

      set({
        items: response.documents as unknown as InventoryItem[],
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch inventory for branch:", error);
      // Optional: toast.error("Failed to load inventory");
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (data) => {
    set({ loading: true });

    try {
      await databases.createDocument(
        DATABASE_ID,
        INVENTORY_COLLECTION_ID,
        ID.unique(),
        data,
      );
      await get().fetchInventoryByBranch(data.branchId || "");
    } finally {
      set({ loading: false });
    }
  },

  // Add this to the implementation
  updateMinStock: async (id, minStock) => {
    set({ loading: true });
    try {
      await databases.updateDocument(DATABASE_ID, INVENTORY_COLLECTION_ID, id, {
        minStock,
      });
      // Update local state so the UI refreshes immediately
      set((state) => ({
        items: state.items.map((item) =>
          item.$id === id ? { ...item, minStock } : item,
        ),
      }));
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async ({
    inventoryId,
    type,
    quantity,
    reason,
    createdBy,
    isLowStock,
  }) => {
    const item = get().items.find((i) => i.$id === inventoryId);
    if (!item) throw new Error("Inventory item not found");

    if (type === "OUT" && item.quantity < quantity) {
      throw new Error("Not enough stock");
    }

    const newQty =
      type === "IN" ? item.quantity + quantity : item.quantity - quantity;

    // 1️⃣ Update inventory quantity
    await databases.updateDocument(
      DATABASE_ID,
      INVENTORY_COLLECTION_ID,
      inventoryId,
      { quantity: newQty, isLowStock },
    );

    // 2️⃣ Log movement
    await databases.createDocument(
      DATABASE_ID,
      INVENTORY_MOVEMENTS_COLLECTION_ID,
      ID.unique(),
      {
        inventoryId,
        type,
        quantity,
        reason,
        branchId: item.branchId,
        createdBy,
      },
    );

    // 3️⃣ Refresh inventory
    await get().fetchInventory();
  },

  // Implementation of deleteProduct
  deleteProduct: async (id: string) => {
    set({ loading: true });
    try {
      await databases.deleteDocument(DATABASE_ID, INVENTORY_COLLECTION_ID, id);

      // Update local state immediately for better UX
      set((state) => ({
        items: state.items.filter((item) => item.$id !== id),
      }));
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  lowStockItems: () => get().items.filter((i) => i.quantity <= i.minStock),

  // totalStockValue: () =>
  //   get().items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
}));

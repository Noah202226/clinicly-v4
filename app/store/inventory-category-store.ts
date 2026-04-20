import { create } from "zustand";
import { ID, Query, Databases } from "appwrite";
import { client } from "@/app/appwrite"; // I-adjust ang path sa iyong appwrite config

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = "inventory-categories";

interface InventoryCategory {
  $id: string;
  name: string;
}

interface CategoryState {
  categories: InventoryCategory[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useInventoryCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderAsc("name")],
      );
      set({ categories: response.documents as unknown as InventoryCategory[] });
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (name: string) => {
    try {
      const newDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        { name },
      );
      set((state) => ({
        categories: [
          ...state.categories,
          newDoc as unknown as InventoryCategory,
        ].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      set((state) => ({
        categories: state.categories.filter((c) => c.$id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));

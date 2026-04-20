import { create } from "zustand";
import { databases } from "@/app/appwrite"; // Adjust path to your Appwrite config
import { ID, Query } from "appwrite";

// Use your actual environment variables here
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = "expense-category";

export interface ExpenseCategory {
  $id: string;
  name: string;
}

interface ExpenseCategoryState {
  categories: ExpenseCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useExpenseCategoryStore = create<ExpenseCategoryState>(
  (set, get) => ({
    categories: [],
    loading: false,
    error: null,

    fetchCategories: async () => {
      set({ loading: true, error: null });
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc("name")], // Sort alphabetically
        );
        // We cast as any to bypass strict type checking, or you can map it strictly
        set({ categories: response.documents as any, loading: false });
      } catch (error: any) {
        console.error("Failed to fetch categories", error);
        set({ error: error.message, loading: false });
      }
    },

    addCategory: async (name: string) => {
      set({ loading: true, error: null });
      try {
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          { name },
        );

        // Update local state without needing to re-fetch from the database
        set((state) => ({
          categories: [...state.categories, response as any],
          loading: false,
        }));
        return true;
      } catch (error: any) {
        console.error("Failed to add category", error);
        set({ error: error.message, loading: false });
        return false;
      }
    },

    deleteCategory: async (id: string) => {
      set({ loading: true, error: null });
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);

        // Remove the item from local state
        set((state) => ({
          categories: state.categories.filter((cat) => cat.$id !== id),
          loading: false,
        }));
        return true;
      } catch (error: any) {
        console.error("Failed to delete category", error);
        set({ error: error.message, loading: false });
        return false;
      }
    },
  }),
);

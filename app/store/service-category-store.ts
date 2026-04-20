import { create } from "zustand";
import { databases } from "@/app/appwrite"; // Adjust path to your appwrite config
import { ID, Query } from "appwrite";

export interface ServiceCategory {
  $id: string;
  name: string;
}

interface ServiceCategoryState {
  categories: ServiceCategory[];
  loading: boolean;
  fetchAllCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!; // Replace with your ID
const COLLECTION_ID = "service-categories"; // Replace with your ID

export const useServiceCategoryStore = create<ServiceCategoryState>((set) => ({
  categories: [],
  loading: false,

  fetchAllCategories: async () => {
    set({ loading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderAsc("name")],
      );
      set({ categories: response.documents as unknown as ServiceCategory[] });
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
          newDoc as unknown as ServiceCategory,
        ].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } catch (error) {
      console.error("Add category error:", error);
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      set((state) => ({
        categories: state.categories.filter((c) => c.$id !== id),
      }));
    } catch (error) {
      console.error("Delete category error:", error);
    }
  },
}));

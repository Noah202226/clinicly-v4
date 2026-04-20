// src/store/branch-store.ts

import { create } from "zustand";
import { ID, Models, AppwriteException } from "appwrite";

// Note: You must fix the import path for your Appwrite configuration file:
// Assuming your config file is at '@/lib/appwrite.ts' as is typical.
import {
  databases,
  DATABASE_ID,
  BRANCHES_COLLECTION_ID,
  Branch,
} from "@/app/appwrite";

// Extend Branch interface for documents returned by Appwrite
interface BranchDocument extends Branch, Models.Document {}

// 1. Define the updated state and action interfaces
interface BranchState {
  branches: BranchDocument[]; // Store the documents with $id and metadata
  currentBranchId: string | null; // Renamed for clarity: tracks the active branch
  isLoading: boolean;
  error: string | null;

  // Actions
  setBranchId: (newBranchId: string | null) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (data: Omit<Branch, "$id">) => Promise<void>;
  updateBranch: (id: string, data: Omit<Branch, "$id">) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}

// 2. Create the store
export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  currentBranchId: null, // Start with null, set upon first fetch
  isLoading: false,
  error: null,

  setBranchId: (newBranchId) => set({ currentBranchId: newBranchId }),

  fetchBranches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BRANCHES_COLLECTION_ID,
      );

      const loadedBranches = response.documents as unknown as BranchDocument[];

      let initialBranchId = get().currentBranchId;
      if (!initialBranchId && loadedBranches.length > 0) {
        // Automatically set the first branch as current if none is selected
        initialBranchId = loadedBranches[0].$id;
      }

      set({
        branches: loadedBranches,
        isLoading: false,
        currentBranchId: initialBranchId,
      });
    } catch (err) {
      console.error("Failed to fetch branches from Appwrite:", err);
      set({
        error: "Could not load branch data.",
        isLoading: false,
      });
    }
  },

  createBranch: async (data) => {
    try {
      // Data is of type Omit<Branch, '$id'> which matches the payload structure
      await databases.createDocument(
        DATABASE_ID,
        BRANCHES_COLLECTION_ID,
        ID.unique(),
        data,
      );
      // Refresh the list in the store
      get().fetchBranches();
    } catch (err) {
      console.error("Failed to create branch:", err);
      throw err; // Re-throw to be handled by the UI (e.g., in handleSave)
    }
  },

  updateBranch: async (id, data) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        BRANCHES_COLLECTION_ID,
        id,
        data,
      );
      get().fetchBranches(); // Refresh the list
    } catch (err) {
      console.error("Failed to update branch:", err);
      throw err;
    }
  },

  deleteBranch: async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, BRANCHES_COLLECTION_ID, id);

      // If the deleted branch was the current one, reset the currentBranchId
      if (get().currentBranchId === id) {
        set({ currentBranchId: null });
      }

      get().fetchBranches(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete branch:", err);
      throw err;
    }
  },
}));

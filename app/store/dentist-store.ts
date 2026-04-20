import { create } from "zustand";
import { ID, Models, AppwriteException } from "appwrite";
import { Dentist } from "@/app/dashboard/settings/types/Dentist"; // Import the Dentist type
import { databases, DATABASE_ID, DENTISTS_COLLECTION_ID } from "@/app/appwrite"; // 🚨 NOTE: Define DENTISTS_COLLECTION_ID

// --- Type Definitions ---
interface DentistDocument extends Dentist, Models.Document {}
type DentistPayload = Omit<Dentist, "$id">;

interface DentistStoreState {
  dentists: DentistDocument[];
  isLoading: boolean;
  error: string | null;

  fetchDentists: () => Promise<void>;
  createDentist: (data: DentistPayload) => Promise<void>;
  updateDentist: (id: string, data: DentistPayload) => Promise<void>;
  deleteDentist: (id: string) => Promise<void>;
}

// --- Store Creation ---
export const useDentistStore = create<DentistStoreState>((set, get) => ({
  dentists: [],
  isLoading: false,
  error: null,

  fetchDentists: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DENTISTS_COLLECTION_ID
      );
      set({
        dentists: response.documents as unknown as DentistDocument[],
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch dentists from Appwrite:", err);
      set({ error: "Could not load dentist data.", isLoading: false });
    }
  },

  createDentist: async (data) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        DENTISTS_COLLECTION_ID,
        ID.unique(),
        data
      );
      get().fetchDentists(); // Refresh the list
    } catch (err) {
      console.error("Failed to create dentist:", err);
      throw err;
    }
  },

  updateDentist: async (id, data) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        DENTISTS_COLLECTION_ID,
        id,
        data
      );
      get().fetchDentists(); // Refresh the list
    } catch (err) {
      console.error("Failed to update dentist:", err);
      throw err;
    }
  },

  deleteDentist: async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, DENTISTS_COLLECTION_ID, id);
      get().fetchDentists(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete dentist:", err);
      throw err;
    }
  },
}));

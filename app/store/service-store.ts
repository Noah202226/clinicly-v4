import { create } from "zustand";
import { ID, Models, AppwriteException } from "appwrite";

import { Service } from "@/app/dashboard/settings/types/Service"; // Import the Service interface
import { databases, DATABASE_ID, SERVICES_COLLECTION_ID } from "@/app/appwrite";

// --- Type Definitions ---

// Extend Service interface for documents returned by Appwrite
interface ServiceDocument extends Service, Models.Document {}

// 🎯 FIX 1: Define the payload type, omitting only the Appwrite-generated ID.
// This ensures branchIds is included in the data passed from the component.
type ServicePayload = Omit<Service, "$id">;

// Define the state and action interfaces for the store
interface ServiceStoreState {
  services: ServiceDocument[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchServices: () => Promise<void>;

  // 🎯 FIX 1: Update action signatures to use the correct payload type
  createService: (data: ServicePayload) => Promise<void>;
  updateService: (id: string, data: ServicePayload) => Promise<void>;

  deleteService: (id: string) => Promise<void>;
}

// --- Store Creation ---

export const useServiceStore = create<ServiceStoreState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SERVICES_COLLECTION_ID
      );

      const loadedServices = response.documents as unknown as ServiceDocument[];

      set({
        services: loadedServices,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch services from Appwrite:", err);
      set({
        error: "Could not load service data.",
        isLoading: false,
      });
    }
  },

  createService: async (data) => {
    try {
      // 🎯 FIX 2: Pass the incoming 'data' directly. It now correctly includes branchIds.
      await databases.createDocument(
        DATABASE_ID,
        SERVICES_COLLECTION_ID,
        ID.unique(),
        data // Pass the full data object
      );
      get().fetchServices(); // Refresh the list
    } catch (err) {
      console.error("Failed to create service:", err);
      throw err;
    }
  },

  updateService: async (id, data) => {
    try {
      // 🎯 FIX 2: Pass the incoming 'data' directly. It now correctly includes branchIds.
      await databases.updateDocument(
        DATABASE_ID,
        SERVICES_COLLECTION_ID,
        id,
        data // Pass the full data object
      );
      get().fetchServices(); // Refresh the list
    } catch (err) {
      console.error("Failed to update service:", err);
      throw err;
    }
  },

  deleteService: async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, SERVICES_COLLECTION_ID, id);
      get().fetchServices(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete service:", err);
      throw err;
    }
  },
}));

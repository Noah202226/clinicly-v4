import { create } from "zustand";
import {
  databases,
  DATABASE_ID,
  PATIENT_CHART_COLLECTION_ID,
} from "@/app/appwrite";
import { ID, Query } from "appwrite";
import { toast } from "react-hot-toast";

export interface ToothRecord {
  $id?: string;
  patientId: string;
  toothNumber: string;
  surfaces: any; // This will be parsed as an object in the component
  note?: any;
}

interface DentalChartState {
  items: ToothRecord[];
  isLoading: boolean;

  // Actions
  fetchPatientChart: (patientId: string) => Promise<void>;
  updateToothRecord: (payload: any) => Promise<void>;
  clearChart: (patientId: string) => Promise<void>;

  // NEW: Helper to find existing local data
  getToothData: (toothNumber: string) => ToothRecord | undefined;
}

export const useDentalChartStore = create<DentalChartState>((set, get) => ({
  items: [],
  isLoading: false,

  // 1. Fetch all tooth records for a specific patient
  fetchPatientChart: async (patientId: string) => {
    if (!patientId) return;
    set({ isLoading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_CHART_COLLECTION_ID!,
        [Query.equal("patientId", patientId)],
      );
      set({ items: response.documents as unknown as ToothRecord[] });
    } catch (error) {
      console.error("Error fetching chart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. Add or Update a tooth record (Upsert Logic)
  updateToothRecord: async (payload: any) => {
    set({ isLoading: true });
    const { $id, patientId, toothNumber, surfaces } = payload;

    // Convert surfaces object to string for Appwrite storage
    const stringifiedSurfaces = JSON.stringify(surfaces);

    try {
      if ($id) {
        // UPDATE existing document
        await databases.updateDocument(
          DATABASE_ID!,
          PATIENT_CHART_COLLECTION_ID!,
          $id,
          {
            surfaces: stringifiedSurfaces,
          },
        );
      } else {
        // CREATE new document
        await databases.createDocument(
          DATABASE_ID!,
          PATIENT_CHART_COLLECTION_ID!,
          ID.unique(),
          {
            patientId,
            toothNumber: String(toothNumber),
            surfaces: stringifiedSurfaces,
          },
        );
      }

      // Refresh the local state to show changes immediately
      await get().fetchPatientChart(patientId);
      toast.success("Tooth record updated");
    } catch (error) {
      console.error("Error saving tooth record:", error);
      toast.error("Failed to save record");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 3. Reset/Clear entire chart for a patient
  clearChart: async (patientId: string) => {
    set({ isLoading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_CHART_COLLECTION_ID!,
        [Query.equal("patientId", patientId)],
      );

      // Delete documents one by one
      const deletePromises = response.documents.map((doc) =>
        databases.deleteDocument(
          DATABASE_ID!,
          PATIENT_CHART_COLLECTION_ID!,
          doc.$id,
        ),
      );

      await Promise.all(deletePromises);
      set({ items: [] });
      toast.success("Chart cleared successfully");
    } catch (error) {
      console.error("Error clearing chart:", error);
      toast.error("Failed to clear chart");
    } finally {
      set({ isLoading: false });
    }
  },

  getToothData: (toothNumber: string) => {
    return get().items.find((i) => i.toothNumber === toothNumber);
  },
}));

import { create } from "zustand";
import { ID, Models, Query } from "appwrite";
import {
  databases,
  DATABASE_ID,
  MEDICAL_HISTORY_COLLECTION_ID,
} from "@/app/appwrite";

export interface MedicalHistory {
  patientId: string;
  // Section 1-9: Yes/No Questions
  isGoodHealth: boolean;
  isUnderTreatment: boolean;
  hasIllnessOperation: boolean;
  isHospitalized: boolean;
  isTakingMeds: boolean;
  usesTobacco: boolean;
  drinksAlcohol: boolean;
  usesDrugs: boolean;
  hasAllergies: boolean;
  // Section 10: Women Only
  isPregnant: boolean;
  isNursing: boolean;
  // Section 11: Conditions Checklist (String Array)
  conditions: string[];
  // Text Details
  allergies: string;
  medications: string;
  pastSurgeries: string;
  otherConditions: string;
}

type MedicalHistoryDocument = MedicalHistory & Models.Document;

interface MedicalHistoryStoreState {
  history: MedicalHistoryDocument | null;
  isLoading: boolean;
  isSaving: boolean;

  fetchMedicalHistory: (patientId: string) => Promise<void>;
  saveMedicalHistory: (
    patientId: string,
    data: MedicalHistory,
  ) => Promise<void>;
}

export const useMedicalHistoryStore = create<MedicalHistoryStoreState>(
  (set, get) => ({
    history: null,
    isLoading: false,
    isSaving: false,

    fetchMedicalHistory: async (patientId: string) => {
      set({ isLoading: true });
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          MEDICAL_HISTORY_COLLECTION_ID,
          [Query.equal("patientId", patientId)],
        );
        set({
          history:
            (response.documents[0] as unknown as MedicalHistoryDocument) ||
            null,
          isLoading: false,
        });
      } catch (err) {
        console.error(err);
        set({ isLoading: false });
      }
    },

    saveMedicalHistory: async (patientId, data) => {
      set({ isSaving: true });
      const existing = get().history;

      // Prepare the payload to match your new Appwrite attributes
      const payload = {
        patientId,
        isGoodHealth: data.isGoodHealth,
        isUnderTreatment: data.isUnderTreatment,
        hasIllnessOperation: data.hasIllnessOperation,
        isHospitalized: data.isHospitalized,
        isTakingMeds: data.isTakingMeds,
        usesTobacco: data.usesTobacco,
        drinksAlcohol: data.drinksAlcohol,
        usesDrugs: data.usesDrugs,
        hasAllergies: data.hasAllergies,
        isPregnant: data.isPregnant,
        isNursing: data.isNursing,
        conditions: data.conditions || [], // This must be an array in Appwrite
        allergies: data.allergies || "",
        medications: data.medications || "",
      };

      try {
        if (existing?.$id) {
          // Update Existing Record
          const updated = await databases.updateDocument(
            DATABASE_ID,
            MEDICAL_HISTORY_COLLECTION_ID,
            existing.$id,
            payload,
          );
          set({ history: updated as unknown as MedicalHistoryDocument });
          console.log("Medical history updated successfully");
        } else {
          // Create New Record
          const created = await databases.createDocument(
            DATABASE_ID,
            MEDICAL_HISTORY_COLLECTION_ID,
            ID.unique(),
            payload,
          );
          set({ history: created as unknown as MedicalHistoryDocument });
          console.log("Medical history created successfully");
        }
      } catch (error) {
        console.error("Appwrite Save Error:", error);
        throw error; // Essential for toast.promise to catch the error
      } finally {
        set({ isSaving: false });
      }
    },
  }),
);

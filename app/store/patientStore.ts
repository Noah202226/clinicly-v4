"use client";

import { create } from "zustand";
import { databases, account, storage } from "@/app/appwrite";
import { ID, Query } from "appwrite";
import {
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  IMAGE_STORAGE_ID,
} from "@/app/appwrite";

// ----------------------------
// Types
// ----------------------------
export interface Patient {
  $id: string;
  lastname: string;
  firstname: string;
  middlename: string;
  phone: string;
  email?: string;
  gender?: string;
  occupation?: string;
  birthdate?: string;
  address?: string;
  emergencyToContact?: string;
  notes?: string;
  branchId: string;
  createdBy?: string;
  remainingBal?: number | undefined;
  $createdAt?: string;
  $updatedAt?: string;
}

interface PatientStore {
  patients: Patient[];
  filtered: Patient[];
  loading: boolean;
  saving: boolean;

  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;

  fetchPatientById: (id: string) => void;
  fetchPatients: (branchId: string) => Promise<void>;
  searchPatients: (query: string) => void;
  createPatient: (data: any, branchId: string) => Promise<void>;
  updatePatient: (id: string, data: any) => Promise<void>;
  deletePatient: (id: string, branchId: string) => Promise<void>;

  patientNameMap: Record<string, string>;
  savePatientSignature: (
    patientId: string,
    signatureBlob: Blob,
  ) => Promise<void>;
}

// ----------------------------
// Zustand Store
// ----------------------------
export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  patientNameMap: {}, // ✅ ADD THIS
  filtered: [],
  loading: false,
  saving: false,

  selectedPatient: null,
  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  // ----------------------------
  // FETCH
  // ----------------------------
  fetchPatients: async (branchId) => {
    if (!branchId) return;

    set({ loading: true });

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        [
          Query.equal("branchId", branchId),
          Query.orderDesc("$createdAt"),
          Query.limit(5000),
        ],
      );

      const docs = res.documents as unknown as Patient[];

      const nameMap: Record<string, string> = {};
      docs.forEach((p) => {
        nameMap[p.$id] = `${p.lastname}, ${p.firstname} ${
          p.middlename ? p.middlename[0] + "." : ""
        }`.trim();
      });

      set({
        patients: docs,
        filtered: docs,
        patientNameMap: nameMap,
      });
    } finally {
      set({ loading: false });
    }
  },
  fetchPatientById: async (id: string) => {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        id,
      );

      const patient = doc as unknown as Patient;

      // // Update the local list so other components get the fresh data too
      // const currentPatients = get().patients;
      // const exists = currentPatients.some((p) => p.$id === id);

      // let updatedList;
      // if (exists) {
      //   updatedList = currentPatients.map((p) => (p.$id === id ? patient : p));
      // } else {
      //   updatedList = [patient, ...currentPatients];
      // }

      // set({ patients: updatedList, filtered: updatedList });
      set({ selectedPatient: patient });
    } catch (error) {
      console.error("Error fetching patient by ID:", error);
      return null;
    }
  },

  // ----------------------------
  // SEARCH
  // ----------------------------
  searchPatients: (query: string) => {
    const all = get().patients;
    if (!query.trim()) return set({ filtered: all });

    const q = query.toLowerCase();

    const results = all.filter((p) => {
      return (
        `${p.lastname} ${p.firstname} ${p.middlename}`
          .toLowerCase()
          .includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        p.$id.toLowerCase().includes(q)
      );
    });

    set({ filtered: results });
  },

  // ----------------------------
  // CREATE
  // ----------------------------
  createPatient: async (data, branchId) => {
    set({ saving: true });

    try {
      const user = await account.get();

      const payload = {
        ...data,
        branchId,
        createdBy: user.$id,
      };

      await databases.createDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        ID.unique(),
        payload,
      );

      await get().fetchPatients(branchId);
    } finally {
      set({ saving: false });
    }
  },

  // ----------------------------
  // UPDATE
  // ----------------------------
  updatePatient: async (id: string, data: any) => {
    set({ saving: true });

    try {
      await databases.updateDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        id,
        data,
      );

      const updated = get().patients.map((p) =>
        p.$id === id ? { ...p, ...data } : p,
      );

      set({ patients: updated, filtered: updated });
    } finally {
      set({ saving: false });
    }
  },

  // ----------------------------
  // DELETE
  // ----------------------------
  deletePatient: async (id: string, branchId: string) => {
    set({ saving: true });
    try {
      await databases.deleteDocument(DATABASE_ID, PATIENT_COLLECTION_ID, id);

      await get().fetchPatients(branchId);
    } finally {
      set({ saving: false });
    }
  },

  savePatientSignature: async (patientId, signatureBlob) => {
    set({ saving: true });
    try {
      // 1. Upload to Appwrite Storage
      // Convert Blob to File object for Appwrite
      const file = new File([signatureBlob], `sig_${patientId}.png`, {
        type: "image/png",
      });

      const uploadedFile = await storage.createFile(
        IMAGE_STORAGE_ID, // Replace with your actual Bucket ID
        ID.unique(),
        file,
      );

      // 2. Update Patient Document with the File ID
      await databases.updateDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        patientId,
        {
          signatureId: uploadedFile.$id, // Ensure you added this attribute in Appwrite Console
        },
      );

      // 3. Refresh local state
      const updated = get().patients.map((p) =>
        p.$id === patientId ? { ...p, signatureId: uploadedFile.$id } : p,
      );
      set({ patients: updated, filtered: updated });
    } catch (error) {
      console.error("Failed to save signature:", error);
      throw error;
    } finally {
      set({ saving: false });
    }
  },
}));

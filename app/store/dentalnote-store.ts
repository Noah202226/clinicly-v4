import { create } from "zustand";
import { ID, Models, Query } from "appwrite";
import {
  databases,
  DATABASE_ID,
  DENTAL_NOTES_COLLECTION_ID,
} from "@/app/appwrite";

export interface DentalNote {
  patientId: string;
  date: string;
  details: string;
  dentistName: string;
}

type DentalNoteDocument = DentalNote & Models.Document;

interface DentalNoteStoreState {
  notes: DentalNoteDocument[];
  isLoading: boolean;
  error: string | null;

  fetchPatientNotes: (patientId: string) => Promise<void>;
  createNote: (data: DentalNote) => Promise<void>;
  deleteNote: (noteId: string, patientId: string) => Promise<void>;
}

export const useDentalNoteStore = create<DentalNoteStoreState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchPatientNotes: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DENTAL_NOTES_COLLECTION_ID,
        [Query.equal("patientId", patientId), Query.orderDesc("date")],
      );
      set({
        notes: response.documents as unknown as DentalNoteDocument[],
        isLoading: false,
      });
    } catch (err) {
      set({ error: "Could not load notes.", isLoading: false });
    }
  },

  createNote: async (data: DentalNote) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        DENTAL_NOTES_COLLECTION_ID,
        ID.unique(),
        data,
      );
      get().fetchPatientNotes(data.patientId);
    } catch (err) {
      throw err;
    }
  },

  deleteNote: async (noteId, patientId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        DENTAL_NOTES_COLLECTION_ID,
        noteId,
      );
      get().fetchPatientNotes(patientId);
    } catch (err) {
      console.error(err);
    }
  },
}));

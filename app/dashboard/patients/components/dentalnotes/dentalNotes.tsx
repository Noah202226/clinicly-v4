"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Plus,
  Trash2,
  StickyNote,
  Loader2,
  AlertCircle,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDentalNoteStore } from "@/app/store/dentalnote-store";
import { useDentistStore } from "@/app/store/dentist-store";
import { format } from "date-fns";
import PatientTransactions from "../PatientTransactionsModal";

export default function DentalNotes({ patient }: { patient: any }) {
  const { notes, createNote, fetchPatientNotes, deleteNote, isLoading } =
    useDentalNoteStore();
  const {
    dentists,
    fetchDentists,
    isLoading: DentistLoading,
  } = useDentistStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [noteDate, setNoteDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [noteDetails, setNoteDetails] = useState("");

  useEffect(() => {
    if (patient?.$id) fetchPatientNotes(patient.$id);
    fetchDentists();
  }, [patient?.$id, fetchPatientNotes, fetchDentists]);

  const handleSaveNote = async () => {
    if (!noteDetails.trim() || !selectedDentist) return;
    setIsSaving(true);
    try {
      await createNote({
        patientId: patient.$id,
        date: noteDate,
        details: noteDetails,
        dentistName: selectedDentist,
      });
      setNoteDetails("");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNote(noteToDelete, patient.$id);
      setNoteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // Main Container: 12-column grid
    <div className="grid grid-cols-1 gap-8 ">
      {/* =========================================
          RIGHT SIDE: TRANSACTIONS (Takes up 5/12)
          ========================================= */}
      <div className="xl:col-span-5 h-full">
        <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
          {/* We wrap PatientTransactions to ensure it fits the container */}
          <PatientTransactions patient={patient} />
        </div>
      </div>

      {/* --- MODALS --- */}
      <Dialog
        open={!!noteToDelete}
        onOpenChange={() => !isDeleting && setNoteToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle>Delete Clinical Note?</DialogTitle>
            <DialogDescription>
              This will permanently remove the record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setNoteToDelete(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="flex-1"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

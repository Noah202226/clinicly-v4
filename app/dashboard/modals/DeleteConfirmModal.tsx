"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { databases } from "@/app/appwrite"; // adjust your import

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
}

export function DeleteConfirmModal({
  open,
  onClose,
  patientId,
  patientName,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      // 🔥 Call Appwrite API
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!,
        patientId
      );

      toast.success(`Patient "${patientName}" deleted`);

      setLoading(false);
      onClose();
      onSuccess?.(); // Refresh parent list
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete patient");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm animate-in fade-in-50 zoom-in-95">
        <DialogHeader>
          <DialogTitle>Delete Patient</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete
            <span className="font-semibold text-red-600"> {patientName}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

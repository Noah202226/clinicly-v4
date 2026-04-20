"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import AppointmentDoc from "../types/AppointmentDoc";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDoc | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            appointment from the database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-sm text-slate-600">
          Are you sure you want to delete the appointment for{" "}
          <strong className="text-slate-900">{appointment.name}</strong> on{" "}
          <span className="font-medium text-slate-900">
            {format(parseISO(appointment.date), "MMM d, yyyy")}
          </span>{" "}
          at{" "}
          <span className="font-medium text-slate-900">{appointment.time}</span>
          ?
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

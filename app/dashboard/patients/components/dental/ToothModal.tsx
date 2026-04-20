"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDentalChartStore } from "@/app/store/dentalchart-store";
import { usePatientStore } from "@/app/store/patientStore";
import { toast } from "sonner";

export default function ToothModal({ tooth, open, onClose }: any) {
  const { updateToothRecord, getToothData } = useDentalChartStore();
  const { selectedPatient } = usePatientStore();

  // Get existing record from store
  const existingRecord = getToothData(String(tooth));

  // Parse surfaces if they exist, otherwise empty object
  const initialSurfaces = existingRecord?.surfaces
    ? typeof existingRecord.surfaces === "string"
      ? JSON.parse(existingRecord.surfaces)
      : existingRecord.surfaces
    : {};

  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      // Logic: You might want to store a general tooth note
      // or extract the note from a specific surface.
      setNote(existingRecord?.note || "");
    }
  }, [open, tooth, existingRecord]);

  const handleSave = async (statusId: string, label: string) => {
    if (!selectedPatient?.$id) return;

    // Build the surface payload (Example: marking the 'center' as the primary status)
    const updatedSurfaces = {
      ...initialSurfaces,
      center: { id: statusId, abbr: label, note: note },
    };

    try {
      await updateToothRecord({
        $id: existingRecord?.$id, // If this exists, store will Update; if not, Create
        patientId: selectedPatient.$id,
        toothNumber: String(tooth),
        surfaces: updatedSurfaces,
      });
      onClose();
    } catch (error) {
      // Error handled by store toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Update: Tooth {tooth}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Internal Note</label>
            <Textarea
              placeholder="Add clinical findings..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => handleSave("healthy", "✓")}
            >
              Healthy
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => handleSave("caries", "C")}
            >
              Caries
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => handleSave("composite", "Co")}
            >
              Filled
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

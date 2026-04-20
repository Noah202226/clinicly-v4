"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import {
  User,
  Calendar as CalendarIcon,
  MapPin,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AppointmentDoc from "../types/AppointmentDoc";
import StatusBadge from "../components/StatusBadge";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDoc | null;
  onOpenDelete: () => void;
  isLoading?: boolean;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onOpenDelete,
  isLoading = false,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  console.log(appointment);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm py-2">
          {/* Patient Section */}
          <section className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User className="h-3 w-3" /> Patient Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Full Name" value={appointment.name} />
              <DetailItem label="Contact Number" value={appointment.phone} />
              <div className="md:col-span-2">
                <DetailItem label="Email Address" value={appointment.email} />
              </div>
            </div>
          </section>

          {/* Schedule Section */}
          <section className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <CalendarIcon className="h-3 w-3" /> Schedule & Service
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-[11px] uppercase font-bold">
                  Branch Location
                </p>
                <p className="font-medium flex items-center gap-1 text-indigo-600">
                  <MapPin className="h-3 w-3" />{" "}
                  {appointment.branchName || "Main Branch"}
                </p>
              </div>
              {/* <DetailItem label="Procedure" value={appointment.serviceName} /> */}
              <DetailItem
                label="Date & Time"
                value={`${format(parseISO(appointment.date), "MMM d, yyyy")} @ ${appointment.time}`}
              />
              <DetailItem
                label="Assigned Dentist"
                value={appointment.dentistName ?? "No Preference"}
              />
            </div>
          </section>

          {/* Acquisition & Notes */}
          <section className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Megaphone className="h-3 w-3" /> Acquisition & Notes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-[11px] uppercase font-bold">
                  How they heard about us
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 mt-1">
                  {appointment.referralSource || "Not Specified"}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] uppercase font-bold">
                  Current Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={appointment.status} />
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-400 text-[11px] uppercase font-bold">
                  Patient's Note
                </p>
                <p className="text-slate-700 italic mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{appointment.note || "No specific notes provided."}"
                </p>
              </div>
            </div>
          </section>

          {/* Footer Metadata */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 italic">
            <span>
              Booked on:{" "}
              {appointment.$createdAt
                ? new Date(appointment.$createdAt).toLocaleString()
                : "—"}
            </span>
            <span>ID: {appointment.$id}</span>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={onOpenDelete}
              disabled={isLoading}
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100"
            >
              Delete Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Small helper component to keep the grid clean
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 text-[11px] uppercase font-bold">{label}</p>
      <p className="text-slate-700 font-medium">{value}</p>
    </div>
  );
}

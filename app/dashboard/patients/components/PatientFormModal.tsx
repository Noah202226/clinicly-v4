"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePatientStore } from "@/app/store/patientStore";
import { useBranchStore } from "@/app/store/branch-store";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  Loader2,
  HeartPulse,
} from "lucide-react";

interface PatientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: any; // If provided, we are in EDIT mode
}

export default function PatientFormModal({
  open,
  onOpenChange,
  patient,
}: PatientFormModalProps) {
  const { createPatient, updatePatient, saving } = usePatientStore();
  const { currentBranchId } = useBranchStore();

  const [form, setForm] = useState({
    lastname: "",
    firstname: "",
    middlename: "",
    phone: "",
    email: "",
    gender: "",
    occupation: "",
    birthdate: "",
    address: "",
    emergencyContactNumber: "",
    notes: "",
  });

  // Sync form with patient prop when editing
  useEffect(() => {
    if (open) {
      if (patient) {
        setForm({
          lastname: patient.lastname ?? "",
          firstname: patient.firstname ?? "",
          middlename: patient.middlename ?? "",
          phone: patient.phone ?? "",
          email: patient.email ?? "",
          gender: patient.gender ?? "",
          occupation: patient.occupation ?? "",
          birthdate: patient.birthdate ?? "",
          address: patient.address ?? "",
          emergencyContactNumber: patient.emergencyContactNumber ?? "",
          notes: patient.notes ?? "",
        });
      } else {
        setForm({
          lastname: "",
          firstname: "",
          middlename: "",
          phone: "",
          email: "",
          gender: "",
          occupation: "",
          birthdate: "",
          address: "",
          emergencyContactNumber: "",
          notes: "",
        });
      }
    }
  }, [patient, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBranchId) {
      console.error("No branch selected. Cannot create patient.");
      return;
    }

    if (patient) {
      await updatePatient(patient.$id, form);
    } else {
      await createPatient(form, currentBranchId);
    }
    onOpenChange(false);
  };

  const inputClasses =
    "rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all h-11 bg-slate-50/50 focus:bg-white";
  const labelClasses =
    "text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-4xl w-full p-0 overflow-hidden border-none shadow-2xl rounded-4xl">
        {/* Header with Gradient Background */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <HeartPulse className="size-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight">
                {patient ? "Edit Patient Record" : "New Patient Record"}
              </DialogTitle>
              <DialogDescription className="text-blue-100 font-medium">
                {patient
                  ? `Modifying clinical details for ${patient.firstname} ${patient.lastname}`
                  : "Fill out the comprehensive form below to register a new patient."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-10 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          {/* Section: Personal Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <User className="size-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Personal Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className={labelClasses}>First Name</Label>
                <Input
                  className={inputClasses}
                  value={form.firstname}
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                  placeholder="Juan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Middle Name</Label>
                <Input
                  className={inputClasses}
                  value={form.middlename}
                  onChange={(e) =>
                    setForm({ ...form, middlename: e.target.value })
                  }
                  placeholder="Dela"
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Last Name</Label>
                <Input
                  className={inputClasses}
                  value={form.lastname}
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                  placeholder="Cruz"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className={labelClasses}>Sex / Gender</Label>
                <select
                  className="w-full flex h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className={labelClasses}>
                  <Calendar className="size-3" /> Date of Birth
                </Label>
                <Input
                  type="date"
                  className={inputClasses}
                  value={form.birthdate}
                  onChange={(e) =>
                    setForm({ ...form, birthdate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Communication & Contact */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <Phone className="size-4 text-green-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Communication & Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className={labelClasses}>Mobile Number</Label>
                <Input
                  className={inputClasses}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0917 XXX XXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>
                  <Mail className="size-3" /> Email Address
                </Label>
                <Input
                  type="email"
                  className={inputClasses}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="juan.cruz@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>
                  <Briefcase className="size-3" /> Occupation
                </Label>
                <Input
                  className={inputClasses}
                  value={form.occupation}
                  onChange={(e) =>
                    setForm({ ...form, occupation: e.target.value })
                  }
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>
                  <AlertCircle className="size-3" /> Emergency Contact No.
                </Label>
                <Input
                  className={inputClasses}
                  value={form.emergencyContactNumber}
                  onChange={(e) =>
                    setForm({ ...form, emergencyContactNumber: e.target.value })
                  }
                  placeholder="Person to call in emergency"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelClasses}>
                <MapPin className="size-3" /> Permanent Residential Address
              </Label>
              <Input
                className={inputClasses}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House No., Street Name, Brgy, City, Province"
              />
            </div>
          </div>

          {/* Section: Medical Notes */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <AlertCircle className="size-4 text-orange-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Clinical Remarks & Allergies
              </h3>
            </div>
            <Textarea
              className="rounded-2xl border-slate-200 min-h-[120px] focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white transition-all p-4"
              placeholder="Please provide any medical history, allergies, or specific notes for this patient..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <p className="hidden md:block text-xs text-slate-400 font-medium italic">
              * Please ensure all required fields are filled correctly.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="rounded-xl font-bold text-slate-500 hover:bg-slate-50 px-6 h-12"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 px-10 font-bold h-12 transition-all active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : patient ? (
                  "Update Record"
                ) : (
                  "Register Patient"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

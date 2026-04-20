"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDentalChartStore } from "@/app/store/dentalchart-store";

// Icons
import {
  User,
  Trash2,
  Edit3,
  Contact2,
  Calendar,
  Phone,
  MapPin,
  ClipboardList,
  Stethoscope,
  FileText,
  Hash,
  StickyNote,
  HeartPulse,
  Fingerprint,
  Mail,
  UserCircle,
  Briefcase,
  ChevronLeft, // Added for the back navigation
} from "lucide-react";

import DentalNotes from "./dentalnotes/dentalNotes";
import MedicalHistoryForm from "./medicalhistory/MedicalHistoryForm";
import DentalChartSection from "./dental/DentalChartSection";
import PatientFormModal from "./PatientFormModal";
import ConsentForm from "../ConsentForm";

interface PatientOverviewProps {
  patient: any;
  onBack: () => void; // Function to set selectedPatient to null in page.tsx
  onDelete: () => void; // Function to open delete confirmation dialog in page.tsx
}

export default function PatientOverview({
  patient,
  onBack,
  onDelete,
}: PatientOverviewProps) {
  const { fetchPatientChart, items, isLoading, updateToothRecord } =
    useDentalChartStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (patient) {
      fetchPatientChart(patient?.$id);
    }
  }, [patient, fetchPatientChart]);

  if (!patient) return null;

  // Modern Styling Constants
  const labelHeaderClass =
    "text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1";
  const infoCardClass =
    "bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200";

  const PatientInfoDetails = () => {
    const fullName =
      `${patient.lastname}, ${patient.firstname} ${patient.middlename || ""}`.trim();

    return (
      <div className="flex flex-col gap-2">
        {/* 1. PRIMARY IDENTITY CARD */}
        <div
          className={`${infoCardClass} text-center relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Fingerprint size={80} />
          </div>

          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="w-full h-full rounded-4xl bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-white shadow-sm flex items-center justify-center">
              <User className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">
            {fullName}
          </h2>

          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> ID:{" "}
              {patient.$id.slice(-8).toUpperCase()}
            </span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />{" "}
              {patient.email || "No email provided"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="outline"
              className="rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 h-11 font-bold text-xs transition-all"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border-red-50 hover:bg-red-50 hover:text-red-600 text-red-400 h-11 font-bold text-xs transition-all"
              onClick={() => onDelete()} // Call the onDelete function passed from page.tsx
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* 2. CLINICAL & PERSONAL BIODATA */}
        <div className={infoCardClass}>
          <h3 className={labelHeaderClass}>Personal Biodata</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4">
            <InfoItem
              icon={<Calendar />}
              label="Birthdate"
              value={
                patient.birthdate
                  ? new Date(patient.birthdate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "---"
              }
            />
            <InfoItem
              icon={<UserCircle />}
              label="Gender"
              value={patient.gender || "Not set"}
            />
            <InfoItem
              icon={<Briefcase />}
              label="Occupation"
              value={patient.occupation || "---"}
            />
            <InfoItem
              icon={<Phone />}
              label="Primary Phone"
              value={patient.phone || "---"}
            />

            <div className="col-span-2 pt-2 border-t border-slate-50">
              <InfoItem
                icon={<MapPin />}
                label="Residential Address"
                value={patient.address || "No address on file"}
                isFullWidth
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3 text-rose-600">
                <HeartPulse size={16} className="animate-pulse" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                  Emergency Contact
                </h3>
              </div>
              <p className="text-sm font-black text-slate-700">
                {patient.emergencyContactNumber || "No Emergency Contact"}
              </p>
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3 text-amber-600">
                <StickyNote size={16} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                  Internal Admin Notes
                </h3>
              </div>
              <p className="text-xs font-medium text-slate-600 italic leading-relaxed">
                {patient.notes ||
                  "No internal notes recorded for this patient."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50">
      {/* 1. Header with Navigation */}
      <header className="px-8 py-5 bg-white border-b border-slate-100 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
            <Contact2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Patient Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Manage clinical records and financial history
            </p>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex w-[380px] border-r border-slate-100 bg-white/50 overflow-y-auto p-6 flex-col gap-4">
          <PatientInfoDetails />
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="chart" className="flex-1 flex flex-col">
            <div className="px-8 bg-white border-b border-slate-100 shrink-0">
              <TabsList className="bg-transparent gap-8 h-14 w-full justify-start items-end p-0">
                <TabTrigger
                  value="info"
                  label="Overview"
                  icon={<User />}
                  isMobileOnly
                />
                <TabTrigger
                  value="chart"
                  label="Dental Chart"
                  icon={<Stethoscope />}
                />
                <TabTrigger
                  value="notes"
                  label="Progress Notes"
                  icon={<ClipboardList />}
                />
                <TabTrigger
                  value="consent"
                  label="Consent"
                  icon={<FileText />}
                />
                <TabTrigger
                  value="medical"
                  label="Medical History"
                  icon={<Stethoscope />}
                />
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-2">
              <TabsContent
                value="info"
                className="lg:hidden m-0 focus-visible:ring-0"
              >
                <PatientInfoDetails />
              </TabsContent>

              <TabsContent value="chart" className="m-0 focus-visible:ring-0">
                <SectionWrapper>
                  <DentalChartSection
                    items={items || []}
                    patientId={patient.$id}
                    patientName={`${patient.firstname} ${patient.lastname}`}
                    onUpdateTooth={updateToothRecord}
                    loading={isLoading}
                  />
                </SectionWrapper>
              </TabsContent>

              <TabsContent value="notes" className="m-0 focus-visible:ring-0">
                <SectionWrapper padding="p-2">
                  <DentalNotes patient={patient} />
                </SectionWrapper>
              </TabsContent>

              <TabsContent value="consent" className="m-0 focus-visible:ring-0">
                <SectionWrapper>
                  <ConsentForm patient={patient} />
                </SectionWrapper>
              </TabsContent>

              <TabsContent value="medical" className="m-0 focus-visible:ring-0">
                <SectionWrapper>
                  <MedicalHistoryForm patient={patient} />
                </SectionWrapper>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>

      {/* Edit Modal (Still useful even on a full page) */}
      <PatientFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        patient={patient}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

const InfoItem = ({ icon, label, value, isFullWidth = false }: any) => (
  <div className={`flex gap-3 ${isFullWidth ? "col-span-2" : ""}`}>
    <div className="mt-1 text-blue-500">
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700 leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const TabTrigger = ({ value, label, icon, isMobileOnly = false }: any) => (
  <TabsTrigger
    value={value}
    className={`
      ${isMobileOnly ? "lg:hidden" : ""}
      flex items-center gap-2 px-0 pb-4 pt-2 bg-transparent rounded-none
      border-b-2 border-transparent 
      data-[state=active]:border-blue-600 data-[state=active]:bg-transparent 
      data-[state=active]:text-blue-600 text-slate-400 font-bold text-sm
      transition-all duration-200
    `}
  >
    {React.cloneElement(icon, { size: 16 })}
    {label}
  </TabsTrigger>
);

const SectionWrapper = ({ children, padding = "p-6" }: any) => (
  <div
    className={`bg-white rounded-4xl border border-slate-100 shadow-sm ${padding}`}
  >
    {children}
  </div>
);

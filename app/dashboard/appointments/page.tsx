"use client";

import * as React from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Share,
  QrCode,
  UserCircle,
  Settings2,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

import { databases } from "@/app/appwrite";
import { Query } from "appwrite";
import { toast } from "sonner";

/* SHADCN SHEET components (right-side drawer for mobile filters) */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CalendarIcon, MapPin, Megaphone, User } from "lucide-react";
import StatusBadge from "./components/StatusBadge";

import AppointmentDoc from "./types/AppointmentDoc";
import { QrShareModal } from "./modals/QrShareModal";
import { ActionModal } from "./modals/ActionModal";
import { AppointmentDetailsModal } from "./modals/AppointmentDetailsModal";
import { DeleteConfirmationModal } from "./modals/DeleteConfirmationModal";
import { AppointmentList } from "./components/appointment-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ------------------------------
// Types (match your schema)
// ------------------------------

type DentistDoc = {
  branchId: string;
  $id: string;
  name: string;
};

// ------------------------------
// Config
// ------------------------------
const DB = process.env.NEXT_PUBLIC_DATABASE_ID!;
const APPOINTMENTS_COL = "appointments";
const DENTISTS_COL = "dentists";

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

// ------------------------------
// Main Component
// ------------------------------
export default function AppointmentMonitoringPage() {
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const qrImageUrl = "/frame.png";

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = React.useState<"today" | "week" | "month">(
    "today",
  );

  const [dentists, setDentists] = React.useState<DentistDoc[]>([]);
  const [dentistFilter, setDentistFilter] = React.useState<string>("all");

  const [appointments, setAppointments] = React.useState<AppointmentDoc[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dentistsLoading, setDentistsLoading] = React.useState<boolean>(false);

  const [branches, setBranches] = React.useState<any[]>([]);
  const [branchFilter, setBranchFilter] = React.useState<string>("all");
  const [branchesLoading, setBranchesLoading] = React.useState(false);

  // mobile sheet open state
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // modals
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedAppt, setSelectedAppt] = React.useState<AppointmentDoc | null>(
    null,
  );

  const [actionModalOpen, setActionModalOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<"approved" | "cancelled">(
    "approved",
  );
  const [emailBody, setEmailBody] = React.useState<string>("");
  const [sendEmailChecked, setSendEmailChecked] = React.useState<boolean>(true);
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);

  // delete
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);

  // load dentists & branches (initial)
  React.useEffect(() => {
    async function loadDentists() {
      setDentistsLoading(true);
      try {
        const res = await databases.listDocuments(DB, DENTISTS_COL);
        setDentists(res.documents as unknown as DentistDoc[]);
      } catch (err) {
        console.error("Failed to load dentists", err);
        toast.error("Failed to load dentists");
      } finally {
        setDentistsLoading(false);
      }
    }

    async function loadBranches() {
      setBranchesLoading(true);
      try {
        const res = await databases.listDocuments(DB, "branches");
        setBranches(res.documents);
      } catch (err) {
        console.error("Failed to load branches", err);
        toast.error("Failed to load branches");
      } finally {
        setBranchesLoading(false);
      }
    }

    loadBranches();
    loadDentists();
  }, []);

  // Updated buildRange to fetch full month when in "today" or "month" view
  // This ensures the calendar sidebar always has data to show counts.
  const buildRange = React.useMemo(() => {
    if (!date) return { startKey: "", endKey: "", label: "" };

    if (viewMode === "today" || viewMode === "month") {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return {
        startKey: format(start, "yyyy-MM-dd"),
        endKey: format(end, "yyyy-MM-dd"),
        label:
          viewMode === "today"
            ? format(date, "MMM d, yyyy")
            : `${format(start, "MMM d, yyyy")} — ${format(end, "MMM d, yyyy")}`,
      };
    }

    if (viewMode === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      return {
        startKey: format(start, "yyyy-MM-dd"),
        endKey: format(end, "yyyy-MM-dd"),
        label: `${format(start, "MMM d, yyyy")} — ${format(end, "MMM d, yyyy")}`,
      };
    }

    return { startKey: "", endKey: "", label: "" };
  }, [date, viewMode]);

  // load appointments when date/viewMode/filter changes
  React.useEffect(() => {
    async function loadAppointments() {
      if (!date) return;
      setLoading(true);

      try {
        const queries: any[] = [];

        // Always query the range determined by buildRange
        queries.push(Query.greaterThanEqual("dateKey", buildRange.startKey));
        queries.push(Query.lessThanEqual("dateKey", buildRange.endKey));
        queries.push(Query.limit(1000)); // Ensure we get enough for the month view

        const res = await databases.listDocuments(
          DB,
          APPOINTMENTS_COL,
          queries,
        );
        let docs = res.documents as unknown as AppointmentDoc[];

        // apply dentist filter
        if (dentistFilter !== "all") {
          if (dentistFilter === "none") {
            docs = docs.filter((d) => (d.dentistId ?? null) === null);
          } else {
            docs = docs.filter((d) => d.dentistId === dentistFilter);
          }
        }

        // Filter by branch
        if (branchFilter !== "all") {
          docs = docs.filter((a) => a.branchId === branchFilter);
        }

        // sort by timestamp ascending
        docs.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

        setAppointments(docs);
      } catch (err) {
        console.error("Failed to load appointments", err);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [date, viewMode, dentistFilter, buildRange, branchFilter]);

  // perform approve/decline and optionally send email
  async function performAction(
    status: "approved" | "cancelled",
    confirmedDate?: string,
    confirmedTime?: string,
  ) {
    if (!selectedAppt) return;
    setActionLoading(true);

    const selectedBranch = branches.find(
      (b) => b.$id === selectedAppt.branchId,
    );

    const appointmentForEmail = {
      ...selectedAppt,
      date: confirmedDate || selectedAppt.date,
      time: confirmedTime || selectedAppt.time,
    };

    // WRAP THE PLAIN TEXT IN HTML HERE
    const finalHtml = getEmailWrapper(
      emailBody,
      status,
      appointmentForEmail,
      selectedBranch,
    );

    try {
      if (sendEmailChecked) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: selectedAppt.email,
            subject:
              status === "approved"
                ? `Confirmed: Appointment for ${selectedAppt.serviceName}`
                : `Update: Appointment for ${selectedAppt.serviceName}`,
            html: finalHtml, // Send the full HTML
          }),
        });
      }

      await databases.updateDocument(DB, APPOINTMENTS_COL, selectedAppt.$id, {
        status,
        date: confirmedDate || selectedAppt.date,
        time: confirmedTime || selectedAppt.time,
      });

      toast.success(
        status === "approved"
          ? "Appointment approved"
          : "Appointment cancelled",
      );
      await reloadAppointments();
      setActionModalOpen(false);
      setDetailModalOpen(false);
    } catch (err) {
      console.error("Action failed:", err);
      toast.error("Failed to update appointment");
    } finally {
      setActionLoading(false);
    }
  }

  // delete appointment
  async function performDelete() {
    if (!selectedAppt) return;
    setDeleteLoading(true);

    try {
      await databases.deleteDocument(DB, APPOINTMENTS_COL, selectedAppt.$id);
      toast.success("Appointment deleted");
      await reloadAppointments();
      setDeleteModalOpen(false);
      setDetailModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete appointment");
    } finally {
      setDeleteLoading(false);
    }
  }

  // helper to reload appointments (using month range logic)
  async function reloadAppointments() {
    if (!date) return;
    setLoading(true);
    try {
      const queries: any[] = [
        Query.greaterThanEqual("dateKey", buildRange.startKey),
        Query.lessThanEqual("dateKey", buildRange.endKey),
        Query.limit(1000),
      ];

      const res = await databases.listDocuments(DB, APPOINTMENTS_COL, queries);
      let docs = res.documents as unknown as AppointmentDoc[];

      if (dentistFilter !== "all") {
        if (dentistFilter === "none") {
          docs = docs.filter((d) => (d.dentistId ?? null) === null);
        } else {
          docs = docs.filter((d) => d.dentistId === dentistFilter);
        }
      }

      if (branchFilter !== "all") {
        docs = docs.filter((a) => a.branchId === branchFilter);
      }

      docs.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      setAppointments(docs);
    } catch (err) {
      console.error("Failed to reload appointments", err);
    } finally {
      setLoading(false);
    }
  }

  const headerRangeLabel = React.useMemo(() => {
    if (!date) return "";
    return buildRange.label;
  }, [date, buildRange]);

  function openDetailModal(appt: AppointmentDoc) {
    setSelectedAppt(appt);
    setDetailModalOpen(true);
  }

  const getEmailWrapper = (
    content: string,
    type: "approved" | "cancelled",
    appt: any,
    branch: any,
  ) => {
    const isApproved = type === "approved";
    const themeColor = isApproved ? "#4f46e5" : "#e11d48";
    const bgColor = isApproved ? "#f8fafc" : "#fff1f2";
    const accentGradient = isApproved
      ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
      : "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)";

    return `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; color: #334155; background-color: ${bgColor};">
      <div style="max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background: ${accentGradient}; padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0;">${isApproved ? "Appointment Confirmed!" : "Appointment Update"}</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hi <strong>${appt.name}</strong>,</p>
          <div style="white-space: pre-wrap; line-height: 1.6; font-size: 15px; color: #475569;">${content}</div>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
             <p style="margin:0; font-size:13px; color:#64748b;"><strong>SCHEDULE DETAILS</strong></p>
             <p style="margin:5px 0 0; font-size:15px; color:#1e293b;">
               ${appt.serviceName}<br/>
               ${format(parseISO(appt.date), "EEEE, MMMM d, yyyy")} @ ${appt.time}<br/>
               📍 ${branch?.name || "Egargue Dental"}
             </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <div style="text-align: center; font-size: 13px; color: #64748b;">
            <p><strong>${branch?.name || "Egargue Dental Group"}</strong></p>
            <p>${branch?.address || ""}</p>
            <p>📞 ${branch?.phone || ""}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  };

  function openActionModal(
    appt: AppointmentDoc,
    type: "approved" | "cancelled",
  ) {
    setSelectedAppt(appt);
    setActionType(type);

    // Set the clean, user-friendly default message
    const defaultMessage =
      type === "approved"
        ? `Your appointment request has been reviewed and successfully approved. We have reserved this time slot for you. 

Please arrive 10-15 minutes early to complete any necessary paperwork. We look forward to seeing you!`
        : `We regret to inform you that we are unable to accommodate your appointment request at this time. 

Possible reasons: The slot might have been double-booked, or the clinic is unavailable. We encourage you to try booking another time slot via our online form.`;

    setEmailBody(defaultMessage);
    setSendEmailChecked(true);
    setActionModalOpen(true);
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Appointment Monitoring
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {headerRangeLabel}
          </p>
        </div>

        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {/* Mobile Sheet */}
            <div className="md:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-indigo-100 bg-white hover:bg-indigo-50 text-indigo-700 shadow-sm"
                  >
                    <Settings2 className="h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-96 p-0 bg-white border-l shadow-2xl flex flex-col h-dvh"
                >
                  <SheetHeader className="p-6 border-b bg-slate-50 shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-xl font-black text-indigo-950 uppercase tracking-tight">
                      <Settings2 className="h-5 w-5 text-indigo-600" /> Filters
                      & View
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* View Mode */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        View Mode
                      </Label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                        {(["today", "week", "month"] as const).map((mode) => (
                          <Button
                            key={mode}
                            size="sm"
                            variant={viewMode === mode ? "default" : "ghost"}
                            onClick={() => setViewMode(mode)}
                            className={`capitalize rounded-lg font-bold ${viewMode === mode ? "bg-indigo-600 text-white" : "text-slate-500"}`}
                          >
                            {mode === "today" ? "Day" : mode}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Branch */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Branch
                      </Label>
                      <Select
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl">
                          <SelectValue placeholder="Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Branches</SelectItem>
                          {branches.map((b) => (
                            <SelectItem key={b.$id} value={b.$id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Dentist
                      </Label>
                      <Select
                        value={dentistFilter}
                        onValueChange={setDentistFilter}
                      >
                        <SelectTrigger className="w-full bg-transparent border-none font-bold text-slate-700 focus:ring-0">
                          <SelectValue placeholder="Dentist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Dentists</SelectItem>
                          {dentists
                            .filter(
                              (d) =>
                                branchFilter === "all" ||
                                d.branchId === branchFilter,
                            )
                            .map((d) => (
                              <SelectItem key={d.$id} value={d.$id}>
                                {d.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-4 border-t bg-slate-50 shrink-0">
                    <Button
                      onClick={() => setSheetOpen(false)}
                      className="w-full h-12 bg-indigo-600 rounded-xl font-bold"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex md:items-center md:gap-4 bg-slate-50/50 p-1 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border shadow-sm">
                {(["today", "week", "month"] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={viewMode === mode ? "default" : "ghost"}
                    onClick={() => setViewMode(mode)}
                    className={`capitalize rounded-lg font-bold ${viewMode === mode ? "bg-indigo-600 text-white" : "text-slate-500"}`}
                  >
                    {mode === "today" ? "Day" : mode}
                  </Button>
                ))}
              </div>
              {/* Branch Select */}
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="h-9 w-40 bg-transparent border-none font-bold text-slate-700 focus:ring-0">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.$id} value={b.$id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dentist Select */}
              <Select value={dentistFilter} onValueChange={setDentistFilter}>
                <SelectTrigger className="h-9 w-40 bg-transparent border-none font-bold text-slate-700 focus:ring-0">
                  <SelectValue placeholder="Dentist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dentists</SelectItem>
                  {dentists
                    .filter(
                      (d) =>
                        branchFilter === "all" || d.branchId === branchFilter,
                    )
                    .map((d) => (
                      <SelectItem key={d.$id} value={d.$id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setQrModalOpen(true)}
              className="flex gap-2 bg-indigo-600 text-white rounded-xl font-bold h-9"
            >
              <QrCode className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Share QR</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="lg:col-span-3">
        <AppointmentList
          appointments={appointments} // Now contains the full month of data
          loading={loading}
          viewMode={viewMode}
          headerRangeLabel={headerRangeLabel}
          branches={branches}
          actionLoading={actionLoading}
          onView={openDetailModal}
          onAction={openActionModal}
          currentDate={date}
          onDateChange={setDate}
        />
      </div>

      {/* Modals */}
      <AppointmentDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        appointment={selectedAppt}
        onOpenDelete={() => {
          setDetailModalOpen(false);
          setDeleteModalOpen(true);
        }}
        isLoading={deleteLoading || actionLoading}
      />
      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        appointment={selectedAppt}
        type={actionType}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        sendEmailChecked={sendEmailChecked}
        setSendEmailChecked={setSendEmailChecked}
        onConfirm={performAction}
        isLoading={actionLoading}
      />
      <QrShareModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrImageUrl={qrImageUrl}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        appointment={selectedAppt}
        onConfirm={performDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}

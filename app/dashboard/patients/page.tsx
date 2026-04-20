"use client";

import React, { useState, useEffect, useMemo } from "react";
import { databases } from "@/app/appwrite";
import { useBranchStore } from "@/app/store/branch-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DATABASE_ID, PATIENT_COLLECTION_ID } from "@/app/appwrite";
import { usePatientStore } from "@/app/store/patientStore";
import PatientOverviewModal from "./components/PatientOverviewModal";
import PatientFormModal from "./components/PatientFormModal"; // Import ang bagong modal
import {
  Loader2,
  Plus,
  Search,
  ArrowUpDown,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export default function PatientCrud() {
  const { currentBranchId } = useBranchStore();
  const {
    fetchPatients,
    patients,
    loading,
    selectedPatient,
    setSelectedPatient,
  } = usePatientStore();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // UI states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // Filtering & Sorting Logic
  // -----------------------------
  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          `${p.firstname} ${p.lastname}`.toLowerCase().includes(q) ||
          p.$id.toLowerCase().includes(q) ||
          (p.phone ?? "").includes(q),
      );
    }

    result.sort((a, b) => {
      const dateA = a.$createdAt ? new Date(a.$createdAt).getTime() : 0;
      const dateB = b.$createdAt ? new Date(b.$createdAt).getTime() : 0;

      switch (sortBy) {
        case "name-asc":
          return (a.lastname || "").localeCompare(b.lastname || "");
        case "name-desc":
          return (b.lastname || "").localeCompare(a.lastname || "");
        case "oldest":
          return dateA - dateB;
        case "newest":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [patients, search, sortBy]);

  useEffect(() => {
    if (currentBranchId) fetchPatients(currentBranchId);
  }, [currentBranchId, fetchPatients]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const openCreate = () => {
    if (!currentBranchId) return toast.error("Select a branch first.");
    setIsCreateOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        selectedPatient.$id,
      );
      toast.success("Deleted successfully");
      setIsDeleteOpen(false);
      setSelectedPatient(null);
      fetchPatients(currentBranchId!);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // CONDITIONAL RENDER
  // -----------------------------

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <PatientOverviewModal
            onBack={() => setSelectedPatient(null)}
            onDelete={() => setIsDeleteOpen(true)}
            patient={selectedPatient}
          />
        </div>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Delete Record?
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                <b>{selectedPatient?.firstname}</b>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                disabled={saving}
              >
                Keep Record
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl font-bold"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Patient Records
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and monitor branch patients
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[140px] bg-white rounded-xl border-slate-200 shadow-sm font-semibold">
              <ArrowUpDown className="size-3 mr-2 text-slate-500" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">A-Z (Last Name)</SelectItem>
              <SelectItem value="name-desc">Z-A (Last Name)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={openCreate}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md font-bold px-6"
          >
            <Plus className="size-4 mr-2" /> New Patient
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <Loader2 className="animate-spin size-8 mx-auto text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-slate-500">
                      Retrieving patient records...
                    </span>
                  </td>
                </tr>
              ) : filteredAndSortedPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-20 text-center text-slate-400 font-medium"
                  >
                    No patients found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedPatients.map((p) => (
                  <tr
                    key={p.$id}
                    className="hover:bg-slate-50/80 transition-colors group hover:cursor-pointer"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {p.lastname[0]}
                          {p.firstname[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {p.lastname}, {p.firstname}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ID: {p.$id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 text-slate-400" />
                        <span className="truncate max-w-[200px]">
                          {p.address || "No address"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <Phone className="size-3 text-slate-400" /> {p.phone}
                        </div>
                        {p.email && (
                          <div className="flex items-center gap-2 text-[12px] text-slate-400">
                            <Mail className="size-3" /> {p.email}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 GINAMIT NA ANG PATIENT FORM MODAL DITO */}
      <PatientFormModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

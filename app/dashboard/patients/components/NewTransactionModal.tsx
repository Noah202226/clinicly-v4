"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTransactionStore } from "@/app/store/transaction-store";
import { useServiceStore } from "@/app/store/service-store";
import { useDentistStore } from "@/app/store/dentist-store";
import { useBranchStore } from "@/app/store/branch-store";
import { usePatientStore } from "@/app/store/patientStore";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Icons
import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Banknote,
  Percent,
  UserCircle2,
  FileSignature,
  Loader2,
  Tag,
} from "lucide-react";
import { useServiceCategoryStore } from "@/app/store/service-category-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  transaction?: any;
}

const defaultFormData = {
  serviceId: "",
  serviceName: "",
  paymentMode: "",
  paymentMethod: "",
  amount: "",
  category: "",
  notes: "",
  date: new Date().toISOString().split("T")[0],
  servicePrice: "",
  discount: 0,
  commissionPercent: 20,
  commission: 0,
  dentist: "",
  branch: "",
};

export default function NewTransactionModal({
  open,
  onOpenChange,
  patient,
  transaction,
}: Props) {
  const [form, setForm] = useState(defaultFormData);
  const isEditMode = !!transaction;

  const { createTransaction, updateTransaction, loading } =
    useTransactionStore();
  const { fetchServices, services } = useServiceStore();
  const { fetchDentists, dentists } = useDentistStore();
  const { updatePatient, fetchPatientById } = usePatientStore();
  const { currentBranchId } = useBranchStore();
  const { categories, fetchAllCategories } = useServiceCategoryStore();

  // 🔵 Populate form for Edit Mode or reset for New Mode
  // We use a ref to track if we've already initialized this specific transaction
  const initializedRef = useRef(false);

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchDentists();
      fetchAllCategories();

      if (transaction && !initializedRef.current) {
        const serviceMatch = services.find(
          (s) =>
            s.name === (transaction.serviceType || transaction.serviceName),
        );

        setForm({
          serviceId: serviceMatch?.$id || "",
          serviceName: transaction.serviceName || transaction.serviceType || "",
          paymentMode: transaction.paymentMode || "",
          paymentMethod: transaction.paymentMethod || "",
          amount: transaction.amount?.toString() || "",
          category: transaction.category || "",
          notes: transaction.notes || "",
          date: transaction.date
            ? new Date(transaction.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          servicePrice: transaction.servicePrice?.toString() || "",
          discount: transaction.discount || 0,
          commissionPercent: transaction.commissionPercent || 20,
          commission: transaction.commission || 0,
          dentist: transaction.dentist || "",
          branch: transaction.branch || currentBranchId || "",
        });
        initializedRef.current = true;
      }
    } else {
      setForm(defaultFormData);
      initializedRef.current = false;
    }
  }, [
    open,
    transaction,
    services,
    currentBranchId,
    fetchServices,
    fetchDentists,
    fetchAllCategories,
  ]);

  const selectedService = services.find((s) => s.$id === form.serviceId);
  const isInstallment = form.paymentMode === "Installment";

  // 🔵 Compute Net Price
  const netPrice = useMemo(() => {
    const manualPrice = Number(form.servicePrice || 0);
    const discount = Number(form.discount || 0);
    return Math.max(manualPrice - discount, 0);
  }, [form.servicePrice, form.discount]);

  // 🔵 Auto compute remaining balance
  const remainingBalance = useMemo(() => {
    const amtPaid = Number(form.amount || 0);
    if (!isInstallment) return 0;
    return Math.max(netPrice - amtPaid, 0);
  }, [netPrice, form.amount, isInstallment]);

  // 🔵 Auto-calculate commission
  useEffect(() => {
    const percent = Number(form.commissionPercent) / 100;
    const calculated = netPrice * percent;
    setForm((prev) => ({
      ...prev,
      commission: Number(calculated.toFixed(2)),
    }));
  }, [netPrice, form.commissionPercent]);

  const handleSubmit = async () => {
    if (!patient) return;
    if (!form.serviceName && !isEditMode)
      return toast.error("Please select a service");
    if (!form.paymentMode) return toast.error("Select payment mode");
    if (!form.paymentMethod) return toast.error("Select payment method");
    if (form.amount === "" || form.amount === null)
      return toast.error("Enter amount paid");

    const amountPaidToday = Number(form.amount);

    const payload = {
      patientId: patient.$id,
      amount: amountPaidToday,
      serviceType:
        form.serviceName || selectedService?.name || transaction?.serviceType,
      paymentMode: form.paymentMode as "Full" | "Installment",
      paymentMethod: form.paymentMethod,
      isInstallment,
      category: form.category,
      remainingBal: isInstallment ? remainingBalance : 0,
      commissionPercent: Number(form.commissionPercent),
      commission: form.commission,
      notes: form.notes || "",
      date: form.date,
      servicePrice: Number(form.servicePrice),
      serviceName: form.serviceName,
      discount: Number(form.discount),
      netPrice: netPrice,
      dentist: form.dentist,
      branch: form.branch || currentBranchId || "",
    };

    let result;
    if (isEditMode) {
      result = await updateTransaction(transaction.$id, payload);
    } else {
      result = await createTransaction(payload);
    }

    if (!result) return toast.error("Failed to save transaction");

    // 🆕 Update Patient Debt Logic
    try {
      const oldDebt = transaction?.remainingBal || 0;
      const newDebt = isInstallment ? remainingBalance : 0;
      const currentTotalBal = patient.remainingBal || 0;

      // Logic: Subtract what they "used to owe" and add what they "now owe"
      const adjustedTotalBal = currentTotalBal - oldDebt + newDebt;

      await updatePatient(patient.$id, {
        remainingBal: Math.max(adjustedTotalBal, 0),
      });
    } catch (error) {
      console.error("Balance update failed:", error);
    }

    toast.success(
      isEditMode ? "Transaction updated!" : "Transaction recorded!",
    );
    fetchPatientById(patient.$id);
    onOpenChange(false);
  };

  if (!patient) return null;

  // CSS Constants
  const inputClass =
    "h-11 border-slate-200 text-sm focus-visible:ring-blue-400 focus-visible:ring-offset-0";
  const sectionClass =
    "space-y-4 border rounded-2xl p-4 bg-slate-50/50 shadow-inner border-slate-100";
  const labelHeaderClass =
    "text-[10px] font-bold text-slate-500 uppercase tracking-widest";
  const subLabelClass =
    "text-xs font-semibold text-slate-700 flex items-center gap-2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-7xl w-full max-h-[90vh] flex flex-col p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-4 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? "Edit Transaction" : "Record New Transaction"}
          </DialogTitle>
          <div className="text-sm text-slate-600 flex items-center gap-2 pt-1 font-medium bg-white border rounded-full px-4 py-1.5 shadow-sm max-w-fit">
            <UserCircle2 className="w-4 h-4 text-blue-500" />
            Patient: {patient.firstname} {patient.lastname}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN */}
            <div className="md:col-span-7 space-y-6">
              <div className={`${sectionClass} bg-white`}>
                <h3 className={labelHeaderClass}>Treatment Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className={subLabelClass}>
                        <ClipboardCheck className="w-3.5 h-3.5" /> Selected
                        Treatment
                      </Label>
                      <Input
                        type="text"
                        value={form.serviceName}
                        onChange={(e) =>
                          setForm({ ...form, serviceName: e.target.value })
                        }
                        className={`${inputClass} font-semibold`}
                        placeholder="Service Name (e.g. Teeth Cleaning)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className={subLabelClass}>
                        <Tag className="w-3.5 h-3.5 text-blue-500" /> Service
                        Category
                      </Label>
                      <select
                        className={`${inputClass} w-full border p-3 rounded-md bg-white text-sm`}
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.$id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className={subLabelClass}>Service Amount</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={form.servicePrice}
                          onChange={(e) =>
                            setForm({ ...form, servicePrice: e.target.value })
                          }
                          className={`${inputClass} font-semibold`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          PHP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={subLabelClass}>
                        <Tag className="w-3.5 h-3.5 text-red-500" /> Discount
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={form.discount}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              discount: Number(e.target.value),
                            })
                          }
                          className={inputClass}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          PHP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={subLabelClass}>Net Service Price</Label>
                      <div className="h-11 flex items-center px-4 bg-blue-600 rounded-md border border-blue-700 font-bold text-white shadow-sm">
                        ₱{netPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-12">
                    <div className={sectionClass}>
                      <Label className={subLabelClass}>
                        <FileSignature className="w-3.5 h-3.5" /> Remarks
                      </Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h3 className={labelHeaderClass}>Billing & Payment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>
                      <CreditCard className="w-3.5 h-3.5" /> Billing Mode
                    </Label>
                    <select
                      className="w-full h-11 border p-2 rounded bg-white text-sm"
                      value={form.paymentMode}
                      onChange={(e) =>
                        setForm({ ...form, paymentMode: e.target.value })
                      }
                    >
                      <option value="">Select mode</option>
                      <option value="Full">Full Payment</option>
                      <option value="Installment">Installment Plan</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>
                      <Banknote className="w-3.5 h-3.5" /> Payment Method
                    </Label>
                    <select
                      className="w-full h-11 border p-2 rounded bg-white text-sm"
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({ ...form, paymentMethod: e.target.value })
                      }
                    >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="E-wallet">GCash/Maya</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="space-y-1.5 relative">
                    <Label className={subLabelClass}>
                      <span className="text-blue-500 font-bold">₱</span> Amount
                      Paid
                    </Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      className={inputClass}
                    />
                    {isInstallment && (
                      <div className="absolute right-4 top-10 text-xs text-amber-900 bg-amber-100 px-3 py-1 rounded-full font-bold">
                        Remaining: ₱{remainingBalance.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:col-span-5 space-y-6">
              <div className={sectionClass}>
                <h3 className={labelHeaderClass}>Clinical Commission</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>
                      <Percent className="w-3.5 h-3.5" /> Rate (%)
                    </Label>
                    <Input
                      type="number"
                      value={form.commissionPercent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commissionPercent: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>Commission Amount</Label>
                    <div className="h-11 flex items-center px-4 bg-slate-100 rounded-md border border-dashed border-slate-300 font-bold">
                      ₱{form.commission.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>
                      <UserCircle2 className="w-3.5 h-3.5" /> Dentist
                    </Label>
                    <select
                      className="w-full h-11 border p-2 rounded bg-white text-sm"
                      value={form.dentist}
                      onChange={(e) =>
                        setForm({ ...form, dentist: e.target.value })
                      }
                    >
                      <option value="">Select dentist</option>
                      {dentists?.map((d) => (
                        <option key={d.$id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={subLabelClass}>
                      <CalendarDays className="w-3.5 h-3.5" /> Date
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Transaction"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

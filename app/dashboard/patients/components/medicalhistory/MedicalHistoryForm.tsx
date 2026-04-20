"use client";
import React, { useEffect, useState } from "react";
import { useMedicalHistoryStore } from "@/app/store/medicalhistory-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, AlertCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const CONDITIONS_LIST = [
  "AIDS or HIV Infection",
  "Anemia",
  "Angina",
  "Arthritis / Rheumatism",
  "Asthma",
  "Bleeding Problems",
  "Blood Diseases",
  "Cancer / Tumor",
  "Chest Pain",
  "Diabetes",
  "Emphysema",
  "Epilepsy / Convulsions",
  "Fainting Seizure",
  "Hay Fever / Allergies",
  "Head Injuries",
  "Heart Attack",
  "Heart Disease",
  "Heart Murmur",
  "Heart Surgery",
  "Hepatitis / Liver Disease",
  "High Blood Pressure",
  "Joint Replacement",
  "Kidney Disease",
  "Low Blood Pressure",
  "Radiation Therapy",
  "Rapid Weight Loss",
  "Respiratory Problems",
  "Rheumatic Fever",
  "Sexually Transmitted Disease",
  "Stomach Troubles / Ulcers",
  "Stroke",
  "Swollen Ankles",
  "Thyroid Problem",
  "Tuberculosis",
];

export default function MedicalHistoryForm({ patient }: { patient: any }) {
  const {
    history,
    fetchMedicalHistory,
    saveMedicalHistory,
    isLoading,
    isSaving,
  } = useMedicalHistoryStore();

  const [formData, setFormData] = useState({
    isGoodHealth: false,
    isUnderTreatment: false,
    hasIllnessOperation: false,
    isHospitalized: false,
    isTakingMeds: false,
    usesTobacco: false,
    drinksAlcohol: false,
    usesDrugs: false,
    hasAllergies: false,
    isPregnant: false,
    isNursing: false,
    conditions: [] as string[],
    allergies: "",
    medications: "",
    pastSurgeries: "",
    otherConditions: "",
  });

  useEffect(() => {
    if (patient?.$id) {
      fetchMedicalHistory(patient.$id).catch(() =>
        toast.error("Failed to load medical history"),
      );
    }
  }, [patient?.$id, fetchMedicalHistory]);

  useEffect(() => {
    if (history) {
      setFormData({
        isGoodHealth: !!history.isGoodHealth,
        isUnderTreatment: !!history.isUnderTreatment,
        hasIllnessOperation: !!history.hasIllnessOperation,
        isHospitalized: !!history.isHospitalized,
        isTakingMeds: !!history.isTakingMeds,
        usesTobacco: !!history.usesTobacco,
        drinksAlcohol: !!history.drinksAlcohol,
        usesDrugs: !!history.usesDrugs,
        hasAllergies: !!history.hasAllergies,
        isPregnant: !!history.isPregnant,
        isNursing: !!history.isNursing,
        conditions: history.conditions || [],
        allergies: history.allergies || "",
        medications: history.medications || "",
        pastSurgeries: history.pastSurgeries || "",
        otherConditions: history.otherConditions || "",
      });
    }
  }, [history]);

  const handleSave = async () => {
    try {
      await toast.promise(
        saveMedicalHistory(patient.$id, {
          ...formData,
          patientId: patient.$id,
        }),
        {
          loading: "Saving medical records...",
          success: "Medical history updated successfully!",
          error: "Failed to update records. Please try again.",
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleYesNo = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500" />
        <p className="text-sm text-slate-500 mt-2">
          Loading medical records...
        </p>
      </div>
    );

  return (
    // Main wrapper with fixed height and flex column
    <div className="flex flex-col h-[600px] bg-white border rounded-xl overflow-hidden shadow-sm">
      {/* 1. STICKY HEADER: High Priority Alerts */}
      {(formData.conditions.includes("Heart Disease") ||
        formData.allergies) && (
        <div className="bg-red-50 border-b border-red-200 p-4 flex gap-3 items-start shrink-0">
          <ShieldAlert className="text-red-600 shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold text-red-800">
              Critical Medical Alerts
            </p>
            <p className="text-xs text-red-700">
              Review heart conditions or allergies before treatment.
            </p>
          </div>
        </div>
      )}

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        {/* SECTION 1-9: General Health Survey */}
        <div className="space-y-1">
          {[
            { id: "isGoodHealth", label: "1. Are you in good health?", num: 1 },
            {
              id: "isUnderTreatment",
              label: "2. Are you under medical treatment now?",
              num: 2,
            },
            {
              id: "hasIllnessOperation",
              label:
                "3. Have you ever had serious illness or surgical operation?",
              num: 3,
            },
            {
              id: "isHospitalized",
              label: "4. Have you ever been hospitalized?",
              num: 4,
            },
            {
              id: "isTakingMeds",
              label: "5. Are you taking any medication?",
              num: 5,
            },
            {
              id: "usesTobacco",
              label: "6. Do you use tobacco products?",
              num: 6,
            },
            {
              id: "drinksAlcohol",
              label: "7. Do you drink alcoholic beverages?",
              num: 7,
            },
            {
              id: "usesDrugs",
              label: "8. Do you use cocaine or other dangerous drugs?",
              num: 8,
            },
            {
              id: "hasAllergies",
              label: "9. Are you allergic to anything?",
              num: 9,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
            >
              <span className="text-sm text-slate-700 font-medium pr-4">
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold mr-3">
                  {item.num}
                </span>
                {item.label}
              </span>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={
                    formData[item.id as keyof typeof formData] === true
                      ? "default"
                      : "outline"
                  }
                  className={`h-8 w-14 text-[10px] uppercase font-bold transition-all ${formData[item.id as keyof typeof formData] === true ? "bg-blue-600" : ""}`}
                  onClick={() => toggleYesNo(item.id, true)}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant={
                    formData[item.id as keyof typeof formData] === false
                      ? "destructive"
                      : "outline"
                  }
                  className="h-8 w-14 text-[10px] uppercase font-bold transition-all"
                  onClick={() => toggleYesNo(item.id, false)}
                >
                  No
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 10: For Women Only */}
        <div className="pt-6 border-t space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded text-[10px] font-bold">
              10
            </span>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              For Women Only
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
            {["isPregnant", "isNursing"].map((field) => (
              <div
                key={field}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100"
              >
                <Label className="text-[13px] text-slate-600">
                  {field === "isPregnant"
                    ? "Are you pregnant?"
                    : "Are you nursing/breastfeeding?"}
                </Label>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant={
                      formData[field as keyof typeof formData]
                        ? "default"
                        : "ghost"
                    }
                    className="h-7 px-4 text-[9px] font-bold"
                    onClick={() => toggleYesNo(field, true)}
                  >
                    YES
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      !formData[field as keyof typeof formData]
                        ? "destructive"
                        : "ghost"
                    }
                    className="h-7 px-4 text-[9px] font-bold"
                    onClick={() => toggleYesNo(field, false)}
                  >
                    NO
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 11: Conditions Checklist */}
        <div className="pt-6 border-t space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
              11
            </span>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Medical Conditions (Check all that apply)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 ml-8">
            {CONDITIONS_LIST.map((condition) => (
              <div
                key={condition}
                className="flex items-center space-x-3 group cursor-pointer"
              >
                <Checkbox
                  id={condition}
                  checked={formData.conditions.includes(condition)}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...formData.conditions, condition]
                      : formData.conditions.filter((c) => c !== condition);
                    setFormData({ ...formData, conditions: updated });
                  }}
                  className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:bg-blue-600 transition-colors"
                />
                <Label
                  htmlFor={condition}
                  className="text-[13px] text-slate-600 cursor-pointer group-hover:text-blue-600 transition-colors font-medium"
                >
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-red-600 flex items-center gap-2 uppercase tracking-wider">
              <AlertCircle size={14} /> Allergies Details
            </Label>
            <Textarea
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              placeholder="List specific allergies (e.g. Penicillin, Latex)..."
              className="min-h-24 text-sm border-slate-200 focus:border-red-200 focus:ring-red-50 bg-white"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Current Medications
            </Label>
            <Textarea
              value={formData.medications}
              onChange={(e) =>
                setFormData({ ...formData, medications: e.target.value })
              }
              placeholder="List current medications and dosages..."
              className="min-h-24 text-sm border-slate-200 focus:border-blue-200 focus:ring-blue-50 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3. STICKY FOOTER: Save Action */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg shadow-md font-bold transition-all active:scale-95 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? "Updating Records..." : "Save Medical History"}
        </Button>
      </div>
    </div>
  );
}

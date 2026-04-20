"use client";
import { useState, useMemo, useRef } from "react";
import Tooth from "./Tooth";
import { notify } from "@/lib/notify"; // Using your saved notify path
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toPng } from "html-to-image";
import { useDentalChartStore } from "@/app/store/dentalchart-store";
import { ToothRecord } from "./types/ToothRecord";

interface DentalChartSectionProps {
  items: ToothRecord[];
  patientId: string;
  onUpdateTooth: (payload: any) => Promise<void>;
  patientName: string;
  loading: boolean;
}

interface SurfaceCondition {
  id: string;
  abbr: string;
  note?: string;
}

interface ToothMap {
  [key: number]: ToothRecord & { surfaces: any };
}

interface SelectionState {
  tooth: number;
  surface: string;
  displayLabel: string;
}

export default function DentalChartSection({
  items = [],
  patientId,
  onUpdateTooth,
  patientName,
  loading,
}: DentalChartSectionProps) {
  const { clearChart } = useDentalChartStore();
  const chartRef = useRef<HTMLDivElement>(null);

  const getSurfaceLabel = (toothNumber: number, position: any) => {
    const num = Number(toothNumber);

    // 1. Determine if it's Maxillary (Upper) or Mandibular (Lower)
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);

    // 2. Determine if it's Anterior (Front: Canine to Canine) or Posterior (Back: Molars/Premolars)
    const isAnterior = [
      11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63,
      71, 72, 73, 81, 82, 83,
    ].includes(num);

    // 3. Determine Quadrant Side (Patient's Right vs Patient's Left)
    // Patient Right: Quadrants 1, 4, 5, 8 | Patient Left: Quadrants 2, 3, 6, 7
    const isPatientRight = [1, 4, 5, 8].includes(Math.floor(num / 10));

    switch (position) {
      case "top":
        // External surface (facing lips/cheeks) for Upper, Internal (facing tongue) for Lower
        if (isUpper) return isAnterior ? "LABIAL" : "BUCCAL";
        return "LINGUAL";

      case "bottom":
        // Internal surface (facing palate) for Upper, External (facing lips/cheeks) for Lower
        if (isUpper) return "PALATAL";
        return isAnterior ? "LABIAL" : "BUCCAL";

      case "left":
        // Left side of the SVG: Away from midline for Right Quads, Toward midline for Left Quads
        return isPatientRight ? "DISTAL" : "MESIAL";

      case "right":
        // Right side of the SVG: Toward midline for Right Quads, Away from midline for Left Quads
        return isPatientRight ? "MESIAL" : "DISTAL";

      case "center":
        // Biting surface
        return isAnterior ? "INCISAL" : "OCCLUSAL";

      default:
        return position;
    }
  };

  const handlePrint = async () => {
    if (!chartRef.current) return;

    const sandbox = document.createElement("div");
    sandbox.style.position = "absolute";
    sandbox.style.left = "-9999px";
    sandbox.style.top = "0";
    sandbox.style.width = "1200px";
    sandbox.style.backgroundColor = "white";
    document.body.appendChild(sandbox);

    const logoData = "/Egargue-logo1-Final.png";

    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => sandbox.appendChild(style.cloneNode(true)));

    const clone = chartRef.current.cloneNode(true) as HTMLElement;
    clone.style.width = "1200px";
    clone.style.backgroundColor = "white";

    // Clean up UI elements for print
    clone.querySelectorAll("button").forEach((btn) => btn.remove());

    sandbox.appendChild(clone);
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const dataUrl = await toPng(clone, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1200,
      });
      document.body.removeChild(sandbox);

      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const chartMaxWidth = pageWidth - margin * 2;

      // --- 1. BUSINESS HEADER (Logo & Details) ---
      // Placeholder for Logo (Replace 'BASE64_LOGO_STRING' with your actual base64)
      pdf.addImage(logoData, "PNG", margin, 10, 20, 20);

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("EGARGUE DENTAL GROUP", margin + 25, 18); // Offset if using logo

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100);
      pdf.text(
        [
          "Caingin, San Rafael, Philippines, 3008",
          "Contact: 0999 540 4747 | email@clinic.com",
        ],
        margin + 25,
        23,
      );

      // --- 2. DOCUMENT TITLE & PATIENT INFO ---
      pdf.setFontSize(14);
      pdf.setTextColor(40);
      pdf.setFont("helvetica", "bold");
      pdf.text("DENTAL CLINICAL RECORD", pageWidth / 2, 45, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.text(`Patient: ${patientName || "N/A"}`, margin, 55);
      pdf.text(
        `Date: ${new Date().toLocaleDateString()}`,
        pageWidth - margin,
        55,
        { align: "right" },
      );

      pdf.setDrawColor(220);
      pdf.line(margin, 58, pageWidth - margin, 58);

      // --- 3. CHART IMAGE ---
      const imgProps = pdf.getImageProperties(dataUrl);
      const displayHeight = (imgProps.height * chartMaxWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", margin, 65, chartMaxWidth, displayHeight);

      // --- 4. FINDINGS TABLE ---
      const tableRows = items.map((item) => {
        const surfaces =
          typeof item.surfaces === "string"
            ? JSON.parse(item.surfaces)
            : item.surfaces;
        const conditions = Object.entries(surfaces || {})
          .filter(([_, val]) => val !== null)
          .map(
            ([key, val]: [string, any]) =>
              `${getSurfaceLabel(Number(item.toothNumber), key)}: ${val.abbr}`,
          )
          .join(", ");

        const notes = Object.entries(surfaces || {})
          .filter(([_, val]: [string, any]) => val?.note)
          .map(
            ([key, val]: [string, any]) =>
              `${getSurfaceLabel(Number(item.toothNumber), key)}: ${val.note}`,
          )
          .join("; ");

        return [item.toothNumber, conditions, notes];
      });

      autoTable(pdf, {
        startY: 75 + displayHeight,
        head: [["Tooth #", "Conditions", "Clinical Remarks"]],
        body: tableRows,
        theme: "striped",
        headStyles: { textColor: 50, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      // --- 5. SIGNATURE LINE ---
      const finalY = (pdf as any).lastAutoTable.finalY + 25;
      pdf.line(pageWidth - 70, finalY, pageWidth - margin, finalY);
      pdf.setFontSize(9);
      pdf.text(
        "Dentist Signature Over Printed Name",
        pageWidth - 42.5,
        finalY + 5,
        { align: "center" },
      );

      pdf.save(`Dental_Chart_${patientName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
    }
  };

  const ARCH_GROUPS = [
    {
      label: "Maxillary Deciduous",
      list: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
      isBaby: true,
    },
    {
      label: "Maxillary Permanent",
      list: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
      isBaby: false,
    },
    {
      label: "Mandibular Permanent",
      list: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
      isBaby: false,
    },
    {
      label: "Mandibular Deciduous",
      list: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
      isBaby: true,
    },
  ];

  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selection, setSelection] = useState<SelectionState | null>(null); // { tooth: 18, surface: 'top' }
  const [surfaceNote, setSurfaceNote] = useState("");

  // Transform flat Appwrite items into a searchable map with parsed JSON
  const toothMap = useMemo(() => {
    const map: ToothMap = {};
    items.forEach((item) => {
      const toothKey = Number(item.toothNumber);
      let parsedSurfaces = {};
      try {
        // Appwrite stores 'surfaces' as a string
        parsedSurfaces =
          typeof item.surfaces === "string"
            ? JSON.parse(item.surfaces)
            : item.surfaces || {};
      } catch (e) {
        parsedSurfaces = {};
      }
      map[toothKey] = { ...item, surfaces: parsedSurfaces };
    });
    return map;
  }, [items]);

  const handleApplyCondition = async (condition: any) => {
    if (!selection) {
      notify.error("Please select a tooth surface first");
      return;
    }

    const actionId = condition ? condition.id : "clear";

    const { tooth, surface } = selection;
    const existingRecord = toothMap[tooth];
    const currentSurfaces = existingRecord?.surfaces || {};

    // 👉 New Structure: surface: { id, abbr, note }
    const updatedSurfaces = {
      ...currentSurfaces,
      [surface]: condition
        ? {
            id: condition.id,
            abbr: condition.abbr,
            note: surfaceNote.trim(), // Attaches the note specifically to this surface
          }
        : null,
    };

    const payload = {
      ...existingRecord,
      toothNumber: String(tooth),
      surfaces: updatedSurfaces, // Will be stringified by your store/modal logic
      patientId: String(patientId),
    };

    try {
      setIsSaving(true);
      setActiveAction(actionId); // Start Loading

      await onUpdateTooth(payload);
      setSurfaceNote("");
      // Optional: notify.success("Saved successfully");
    } catch (error) {
      console.error(error);
      notify.error(`Failed to save. Error: ${error}`);
    } finally {
      setIsSaving(false); // Stop Loading
      setActiveAction(null); // I-reset pagkatapos
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure? This will delete all findings for this patient.",
      )
    ) {
      await clearChart(patientId);
    }
  };

  // Grouped for better UI organization
  const CONDITION_GROUPS = [
    {
      name: "Tooth Condition",
      items: [
        { id: "present", label: "Present", abbr: "P", color: "bg-emerald-500" },
        { id: "missing", label: "Missing", abbr: "M", color: "bg-zinc-400" },
        {
          id: "unerupted",
          label: "Unerupted",
          abbr: "U",
          color: "bg-orange-400",
        },
        {
          id: "impacted",
          label: "Impacted",
          abbr: "I",
          color: "bg-orange-500",
        },
        {
          id: "root_stump",
          label: "Root Stump",
          abbr: "RS",
          color: "bg-zinc-700",
        },
      ],
    },
    {
      name: "Caries / Restoration",
      items: [
        {
          id: "caries",
          label: "Dental Caries",
          abbr: "C",
          color: "bg-red-500",
        },
        {
          id: "recurrent_caries",
          label: "Recurrent Caries",
          abbr: "RC",
          color: "bg-red-600",
        },
        { id: "amalgam", label: "Amalgam", abbr: "Am", color: "bg-blue-600" },
        {
          id: "composite",
          label: "Composite",
          abbr: "Co",
          color: "bg-blue-500",
        },
        {
          id: "gic",
          label: "Glass Ionomer",
          abbr: "GIC",
          color: "bg-cyan-500",
        },
        {
          id: "temporary",
          label: "Temporary Filling",
          abbr: "Temp",
          color: "bg-sky-400",
        },
      ],
    },
    {
      name: "Tooth Defects",
      items: [
        {
          id: "fractured",
          label: "Fractured Tooth",
          abbr: "Fx",
          color: "bg-red-700",
        },
        {
          id: "attrition",
          label: "Attrition",
          abbr: "Attr",
          color: "bg-amber-700",
        },
        {
          id: "abrasion",
          label: "Abrasion",
          abbr: "Abr",
          color: "bg-amber-600",
        },
        { id: "erosion", label: "Erosion", abbr: "Ero", color: "bg-amber-500" },
        {
          id: "hypoplasia",
          label: "Enamel Hypoplasia",
          abbr: "Hypo",
          color: "bg-yellow-500",
        },
      ],
    },
    {
      name: "Endodontic / Pulp",
      items: [
        {
          id: "rct",
          label: "Root Canal Treated",
          abbr: "RCT",
          color: "bg-purple-600",
        },
      ],
    },
    {
      name: "Prosthesis",
      items: [
        { id: "crown", label: "Crown", abbr: "Cr", color: "bg-fuchsia-600" },
        { id: "bridge", label: "Bridge", abbr: "Br", color: "bg-indigo-600" },
        { id: "veneer", label: "Veneer", abbr: "V", color: "bg-pink-500" },
        { id: "implant", label: "Implant", abbr: "Imp", color: "bg-slate-700" },
      ],
    },
  ];

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 p-2 sm:p-4 lg:p-6 max-w-full mx-auto overflow-auto h-[600]">
      {/* LEFT: THE CHART */}
      <div className="xl:col-span-9 bg-white dark:bg-zinc-900 border border-[#DCD1B4] rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-sm">
        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="btn btn-primary rounded-2xl flex items-center gap-2"
          >
            Print Dental Chart
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 text-[10px] font-black uppercase bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100"
          >
            {loading ? "Clearing..." : "Reset Chart"}
          </button>
        </div>

        <div
          ref={chartRef}
          className="space-y-8 overflow-x-auto pb-4 custom-scrollbar flex flex-col"
        >
          {ARCH_GROUPS.map((arch) => (
            // To this (Remove the ml- classes):
            <div
              key={arch.label}
              className="flex flex-col items-center w-full min-w-max"
            >
              {/* Siguraduhin na hindi liliit sa 600px sa mobile */}
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center mb-4">
                {arch.label}
              </div>

              {/* <div className="flex justify-center items-center gap-1 sm:gap-4 lg:gap-8 w-max mx-auto shrink-0"> */}
              <div className="flex justify-center items-center w-full max-w-5xl mx-auto px-2">
                {/* We split the list in half to create the Left/Right visual gap */}
                <div className="flex flex-1 justify-end gap-1 sm:gap-2 min-w-max">
                  {arch.list.slice(0, arch.list.length / 2).map((num) => (
                    <div
                      key={num}
                      className="scale-75 sm:scale-90 lg:scale-100 shrink-0"
                    >
                      <Tooth
                        key={num}
                        toothNumber={num}
                        surfaces={toothMap[num]?.surfaces ?? {}}
                        selectedSurface={selection}
                        onSurfaceClick={(tooth: any, surface: any) => {
                          // We calculate the clinical label on the fly
                          const clinicalLabel = getSurfaceLabel(tooth, surface);

                          setSelection({
                            tooth,
                            surface,
                            displayLabel: clinicalLabel, // Store this for the UI
                          });

                          setSurfaceNote(
                            toothMap[tooth]?.surfaces?.[surface]?.note || "",
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* CENTER MIDLINE DIVIDER */}
                <div className="flex flex-col items-center justify-center mx-1 sm:mx-4 shrink-0">
                  <div className="h-18 w-[1.5px] bg-zinc-300 dark:bg-zinc-700" />
                </div>

                <div className="flex flex-1 justify-start gap-1 sm:gap-2 min-w-max">
                  {arch.list.slice(arch.list.length / 2).map((num) => (
                    <div
                      key={num}
                      className="scale-75 sm:scale-90 lg:scale-100 shrink-0"
                    >
                      <Tooth
                        key={num}
                        toothNumber={num}
                        surfaces={toothMap[num]?.surfaces ?? {}}
                        selectedSurface={selection}
                        onSurfaceClick={(tooth, surface) => {
                          // We calculate the clinical label on the fly
                          const clinicalLabel = getSurfaceLabel(tooth, surface);

                          setSelection({
                            tooth,
                            surface,
                            displayLabel: clinicalLabel, // Store this for the UI
                          });

                          setSurfaceNote(
                            toothMap[tooth]?.surfaces?.[surface]?.note || "",
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: CONDITION SUMMARY */}
        <div className="mt-8 sm:mt-12 bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-4xl border border-zinc-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-50">
            <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
              Recorded Findings
            </h3>
          </div>

          <div className="overflow-x-auto shadow-inner">
            {" "}
            {/* Responsive wrapper for table */}
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-3">Tooth</th>
                  <th className="px-8 py-3">Surfaces / Conditions</th>
                  <th className="px-8 py-3">Surface Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-10 text-center text-zinc-400 text-xs italic"
                    >
                      No findings recorded yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const surfaces =
                      typeof item.surfaces === "string"
                        ? JSON.parse(item.surfaces)
                        : item.surfaces;
                    return (
                      <tr
                        key={item.$id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-8 py-4">
                          <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-black">
                            {item.toothNumber}
                          </span>
                        </td>

                        <td className="px-8 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(
                              Object.entries(surfaces || {}) as [string, any][]
                            ).map(
                              ([key, val]) =>
                                val && (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 ..."
                                  >
                                    <span className="text-[10px] font-black uppercase text-zinc-400">
                                      {getSurfaceLabel(
                                        Number(item.toothNumber),
                                        key,
                                      )}
                                      :
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-700">
                                      {/* Now TS knows 'val' has an 'abbr' property */}
                                      {(val as { abbr: string }).abbr}
                                    </span>
                                  </span>
                                ),
                            )}
                          </div>
                        </td>

                        <td className="px-8 py-4">
                          <div className="space-y-1">
                            {/* Cast the entries to let TS know 'val' has a 'note' property */}
                            {(
                              Object.entries(surfaces || {}) as [
                                string,
                                { note?: string },
                              ][]
                            ).map(
                              ([key, val]) =>
                                val?.note && (
                                  <div
                                    key={key}
                                    className="text-[11px] text-zinc-500"
                                  >
                                    <strong className="uppercase text-zinc-400 mr-1">
                                      {key}:
                                    </strong>{" "}
                                    {val.note}
                                  </div>
                                ),
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT: THE CONTROLS & STATUS BUTTONS */}
      <div className="xl:col-span-3 space-y-6">
        <div className="sticky top-6 space-y-4">
          {/* Naka-float ito sa desktop habang nag-scro-scroll */}
          {/* Note Area */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-200 shadow-inner">
            <h3 className="text-xs font-black uppercase text-zinc-400 mb-2">
              {selection
                ? `Tooth ${selection.tooth} - ${selection.displayLabel}`
                : "Select a surface part"}
            </h3>
            <textarea
              value={surfaceNote}
              readOnly={isSaving} // Prevent typing while saving
              onChange={(e) => setSurfaceNote(e.target.value)}
              placeholder={isSaving ? "Saving note..." : "Add specific note..."}
              className={`w-full p-3 ... ${isSaving ? "bg-zinc-100 opacity-70" : "bg-white"}`}
              rows={2}
            />
          </div>
          {/* Rendering All Status Buttons */}
          {/* Buttons Section - Gawing 2 columns sa tablet, 1 column sa desktop sidebar */}
          <div className="space-y-6 max-h-[50vh] xl:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {CONDITION_GROUPS.map((group) => (
              <div key={group.name} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 px-2 tracking-widest">
                  {group.name}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-2">
                  {group.items.map((item) => {
                    const isLoadingThis = activeAction === item.id;

                    return (
                      <button
                        key={item.id}
                        disabled={!selection || isSaving} // Disable lahat kapag may sinesave
                        onClick={() => handleApplyCondition(item)}
                        className={`flex items-center gap-3 p-2 border rounded-xl transition-all
        ${!selection || isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-50"}
        ${isLoadingThis ? "border-blue-500 bg-blue-50" : "border-zinc-100"}
      `}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${item.color}`}
                        >
                          {isLoadingThis ? "..." : item.abbr}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">
                          {isLoadingThis ? "Saving..." : item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Clear Button */}
          <button
            onClick={() => handleApplyCondition(null)}
            disabled={!selection || isSaving}
            className="w-full p-4 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 shadow-lg active:scale-95"
          >
            {activeAction === "clear" ? "Clearing..." : "Clear Surface"}
          </button>
        </div>
      </div>
    </div>
  );
}

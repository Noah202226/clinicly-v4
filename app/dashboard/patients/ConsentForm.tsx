"use client";

import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/app/store/patientStore";
import {
  FileText,
  Eraser,
  Download,
  CloudUpload,
  Loader2,
  CheckCircle2,
  History,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { storage, IMAGE_STORAGE_ID } from "@/app/appwrite";
import { Textarea } from "@/components/ui/textarea";

interface ConsentFormProps {
  patient: any;
}

export default function ConsentForm({ patient }: ConsentFormProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isNewSignature, setIsNewSignature] = useState(false);
  const [done, setDone] = useState(false);

  const [consentDetails, setConsentDetails] = useState(
    `I hereby authorize the dentist to perform the necessary dental procedures as discussed. I understand the risks, benefits, and alternatives to the treatment. I agree to be responsible for all costs related to the treatment provided.\n\nThis consent remains valid until revoked by me in writing.`,
  );

  const { savePatientSignature, saving } = usePatientStore();

  // FIX: Ensure this returns a string
  const existingSigUrl = useMemo(() => {
    if (!patient?.signatureId) return "";
    return storage
      .getFilePreview(IMAGE_STORAGE_ID, patient.signatureId)
      .toString();
  }, [patient?.signatureId]);

  const generatePDF = async () => {
    const doc = new jsPDF();
    let signatureImage: string | undefined = "";

    if (isNewSignature && sigCanvas.current) {
      signatureImage = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
    } else if (existingSigUrl) {
      signatureImage = existingSigUrl;
    }

    if (!signatureImage) {
      toast.error("No signature available to generate PDF");
      return;
    }

    // --- 1. CLINIC HEADER SECTION ---
    // Replace the 'DATA_URL' below with your actual Base64 string (starts with data:image/png;base64,...)
    const clinicLogo = "/Egargue-logo1-Final.png";

    try {
      // If you have a logo, uncomment the line below:
      // doc.addImage(clinicLogo, 'PNG', 20, 10, 30, 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("EGARGUE DENTAL GROUP", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("123 Dental Lane, Medical Plaza, City Center", 105, 27, {
        align: "center",
      });
      doc.text(
        "Phone: (555) 012-3456 | Email: hello@smiledental.com",
        105,
        32,
        { align: "center" },
      );

      // Horizontal Line
      doc.setDrawColor(203, 213, 225); // slate-200
      doc.line(20, 40, 190, 40);

      // --- 2. DOCUMENT TITLE & PATIENT INFO ---
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("TREATMENT CONSENT FORM", 20, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`PATIENT NAME:`, 20, 65);
      doc.setFont("helvetica", "bold");
      doc.text(`${patient.firstname} ${patient.lastname}`, 55, 65);

      doc.setFont("helvetica", "normal");
      doc.text(`DATE ISSUED:`, 20, 72);
      doc.text(`${new Date().toLocaleDateString()}`, 55, 72);

      // --- 3. CONSENT CONTENT ---
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("CONSENT DETAILS:", 20, 85);

      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(consentDetails, 170);
      doc.text(splitText, 20, 95);

      // --- 4. SIGNATURE SECTION ---
      // Position signature near bottom
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(203, 213, 225);
      doc.line(20, pageHeight - 60, 80, pageHeight - 60); // Signature line

      doc.setFontSize(9);
      doc.text("Patient Digital Signature", 20, pageHeight - 55);
      doc.text(
        `Timestamp: ${new Date().toLocaleString()}`,
        20,
        pageHeight - 50,
      );

      // Add the signature image above the line
      doc.addImage(signatureImage, "PNG", 20, pageHeight - 85, 50, 20);

      doc.save(`Consent_${patient.lastname}_${new Date().getTime()}.pdf`);
      toast.success("Professional PDF Generated");
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF. Check if logo format is correct.");
    }
  };

  const handleUpload = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
    const canvas = sigCanvas.current.getTrimmedCanvas();
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await savePatientSignature(patient.$id, blob);
          setDone(true);
          setIsNewSignature(false);
          toast.success("New signature saved to record!");
        } catch (err) {
          toast.error("Failed to upload signature.");
        }
      }
    }, "image/png");
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setIsNewSignature(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-bold">Record Updated</h3>
        <p className="text-slate-500">
          The patient's signature has been refreshed.
        </p>
        <Button variant="outline" onClick={() => setDone(false)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Consent Customization
          </h3>
          {existingSigUrl && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
              <History className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-bold text-green-600 uppercase">
                Verified Sign On File
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Consent Agreement Text
          </label>
          <Textarea
            value={consentDetails}
            onChange={(e) => setConsentDetails(e.target.value)}
            className="min-h-[120px] bg-white border-slate-200 text-sm leading-relaxed focus:ring-primary shadow-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {existingSigUrl
                ? "Update Signature (Optional)"
                : "Required: Patient E-Signature"}
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl bg-white overflow-hidden relative">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#0f172a"
                canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
                onEnd={() => setIsNewSignature(true)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="text-slate-400 hover:text-red-500 text-xs h-8"
              >
                <Eraser className="w-3.5 h-3.5 mr-1" /> Clear Pad
              </Button>
              {isNewSignature && (
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={saving}
                  className="h-8 text-xs bg-primary"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <CloudUpload className="w-3 h-3 mr-1" />
                  )}
                  Save New Sign
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase">
                Document Status
              </h4>
              {existingSigUrl || isNewSignature ? (
                <div className="space-y-4">
                  <div className="h-20 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed p-2">
                    <img
                      src={
                        isNewSignature
                          ? sigCanvas.current?.getTrimmedCanvas().toDataURL()
                          : existingSigUrl
                      }
                      alt="Current Signature"
                      className="max-h-full mix-blend-multiply"
                    />
                  </div>
                  <Button
                    variant="default"
                    className="w-full h-12 shadow-md gap-2"
                    onClick={generatePDF}
                  >
                    <Download className="w-5 h-5" /> Download Consent PDF
                  </Button>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed rounded-lg">
                  <FileText className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] text-center px-4">
                    Waiting for signature to enable PDF download
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

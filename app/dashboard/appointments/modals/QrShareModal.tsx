"use client";

import { Copy, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Switching to Shadcn Dialog for better accessibility
import copyQrToClipboard from "../components/copyQrToClipboard";
import shareQr from "../components/shareQr";
import Link from "next/link";

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrImageUrl: string;
}

export function QrShareModal({
  isOpen,
  onClose,
  qrImageUrl,
}: QrShareModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Appointment QR</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* QR Image Container */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
            <img
              src={qrImageUrl}
              alt="Appointment QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>

          <Link
            href="https://appointment-egargue-dental.vercel.app/"
            target="_blank"
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            <Button variant="secondary" className="flex gap-2">
              Appointment Form Link
            </Button>
          </Link>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <Button
              onClick={copyQrToClipboard}
              variant="secondary"
              className="flex gap-2"
            >
              <Copy className="h-4 w-4" /> Copy Image
            </Button>

            <Button onClick={shareQr} className="flex gap-2">
              <Share className="h-4 w-4" /> Share with Client
            </Button>

            <a
              href={qrImageUrl}
              download="appointment-qr.png"
              className="w-full sm:w-auto"
            >
              <Button variant="ghost" className="w-full">
                Download
              </Button>
            </a>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Clients can scan this to open the booking form directly on their
            phones.
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

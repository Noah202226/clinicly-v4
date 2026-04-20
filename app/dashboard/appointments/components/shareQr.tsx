import { toast } from "sonner";

const qrImageUrl = "/frame.png";
// Helper function to share (mobile/supported browsers)
const shareQr = async () => {
  if (navigator.share) {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "appointment-qr.png", {
        type: blob.type,
      });
      await navigator.share({
        files: [file],
        title: "Egargue Dental Appointment QR",
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  } else {
    toast.error("Sharing not supported on this browser.");
  }
};

export default shareQr;

const qrImageUrl = "/frame.png";
import { toast } from "sonner";

// Helper function to copy image to clipboard (works in modern browsers)
const copyQrToClipboard = async () => {
  try {
    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    toast.success("QR Code copied to clipboard!");
  } catch (err) {
    toast.error("Failed to copy. Try downloading the image.");
  }
};

export default copyQrToClipboard;

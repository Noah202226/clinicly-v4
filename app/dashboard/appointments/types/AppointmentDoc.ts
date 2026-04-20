import { Models } from "appwrite";

export interface AppointmentDoc extends Models.Document {
  branchId: string;
  name: string;
  email: string;
  address: string;
  gender: string;
  dateOfBirth: string; // ISO string
  phone: string;
  date: string; // ISO string
  dateKey: string; // yyyy-MM-dd
  time: string; // "10:00 AM"
  note?: string;
  referralSource?: string;
  branchName?: string;
  timestamp: number;
  serviceId: string;
  serviceName: string;
  dentistId?: string | null;
  dentistName?: string | null;
  status: "pending" | "approved" | "cancelled"; // Literal types provide better IntelliSense
  serviceDuration?: number;
}

export default AppointmentDoc;

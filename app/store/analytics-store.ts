"use client";

import { create } from "zustand";
import { Query } from "appwrite";
import { databases, DATABASE_ID } from "@/app/appwrite";
import toast from "react-hot-toast";

export type RangeType = "7d" | "30d" | "90d" | "month"; // Added 'month' type

const TRANSACTIONS = "transactions";
const APPOINTMENTS = "appointments";

/* =========================
    DATE HELPERS
========================= */
const toDateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

const normalizeStatus = (status?: string) => {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (["approved", "confirmed", "done", "completed"].includes(s))
    return "approved";
  if (["cancelled", "canceled", "no-show"].includes(s)) return "cancelled";
  return "pending";
};

/* =========================
    TYPES
========================= */
interface ChartData {
  revenueByDay: { date: string; total: number }[];
  topServices: { name: string; total: number }[];
  appointmentStatus: { status: string; count: number }[];
  referralStats: { source: string; count: number }[];
}

interface AnalyticsState {
  loading: boolean;
  selectedMonth: string; // "01", "02", etc.
  selectedYear: string;
  upcomingAppointments: any[];
  pendingAppointments: any[];
  kpis: {
    totalRevenue: number;
    totalAppointments: number;
    pendingCount: number;
    cancellationRate: number;
    avgAppointmentTime: number;
    topReferralSource: string;
  };
  charts: ChartData;
  // Updated fetch signature to prioritize month filtering
  fetchAnalytics: (branchId: string, month?: string, year?: string) => void;
}

/* =========================
    STORE
========================= */
export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  loading: false,
  selectedMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
  selectedYear: String(new Date().getFullYear()),
  upcomingAppointments: [],
  pendingAppointments: [],

  kpis: {
    totalRevenue: 0,
    totalAppointments: 0,
    cancellationRate: 0,
    avgAppointmentTime: 45,
    topReferralSource: "N/A",
    pendingCount: 0,
  },

  charts: {
    revenueByDay: [],
    topServices: [],
    appointmentStatus: [],
    referralStats: [],
  },

  fetchAnalytics: async (branchId: string, month?: string, year?: string) => {
    if (!branchId) return;

    // I-update ang state kung may bagong selection
    if (month) set({ selectedMonth: month });
    if (year) set({ selectedYear: year });

    const targetMonth = month || get().selectedMonth;
    const targetYear = year || get().selectedYear;

    set({ loading: true });

    try {
      // 1. Fetch all documents for the branch WITHOUT the strict Appwrite date query
      const [txRes, apptRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, TRANSACTIONS, [
          Query.equal("branch", branchId),
          Query.equal("deleted", false),
          Query.limit(5000),
        ]),
        databases.listDocuments(DATABASE_ID, APPOINTMENTS, [
          Query.equal("branchId", branchId),
          Query.limit(5000),
        ]),
      ]);

      // Logic Switch: I-check kung match ang Month AT Year
      const isTargetPeriod = (dateString?: string) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return false;

        const docMonth = String(d.getMonth() + 1).padStart(2, "0");
        const docYear = String(d.getFullYear());

        return docMonth === targetMonth && docYear === targetYear;
      };

      const filteredTransactions = txRes.documents.filter((t) =>
        isTargetPeriod(t.date),
      );
      const filteredAppointmentsRaw = apptRes.documents.filter((a) =>
        isTargetPeriod(a.date),
      );

      // 4. Normalize statuses for the filtered appointments
      const appointments = filteredAppointmentsRaw.map((a: any) => ({
        ...a,
        status: normalizeStatus(a.status),
      }));

      /* =========================
          BASIC KPIs
      ========================= */
      // Use 'filteredTransactions' instead of 'txRes.documents'
      const totalRevenue = filteredTransactions.reduce(
        (sum: number, t: any) => sum + (t.amount || 0),
        0,
      );

      const pendingAppointments = appointments.filter(
        (a) => a.status === "pending",
      );
      const pendingCount = pendingAppointments.length;

      const cancelledCount = appointments.filter(
        (a) => a.status === "cancelled",
      ).length;
      const totalAppointments = appointments.length;

      /* =========================
          REVENUE BY DAY
      ========================= */
      const revenueByDayMap = new Map<string, number>();
      filteredTransactions.forEach((t: any) => {
        if (!t.date) return;
        revenueByDayMap.set(
          t.date,
          (revenueByDayMap.get(t.date) || 0) + (t.amount || 0),
        );
      });
      const revenueByDay = Array.from(revenueByDayMap, ([date, total]) => ({
        date,
        total,
      }));

      /* =========================
          TOP SERVICES
      ========================= */
      const serviceMap = new Map();
      filteredTransactions.forEach((t) => {
        const name = t.serviceType || "Unknown";
        serviceMap.set(name, (serviceMap.get(name) || 0) + (t.amount || 0));
      });

      const topServices = Array.from(serviceMap, ([name, total]) => ({
        name,
        total,
      }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      /* =========================
          APPOINTMENT STATUS
      ========================= */
      const statusMap = new Map();
      appointments.forEach((a) => {
        const status = a.status;
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const appointmentStatus = Array.from(statusMap, ([status, count]) => ({
        status,
        count,
      }));

      /* =========================
          REFERRAL SOURCE LOGIC
      ========================= */
      const referralMap = new Map();
      appointments.forEach((a) => {
        const source =
          a.referralSource && a.referralSource.trim() !== ""
            ? a.referralSource
            : "Unknown";
        referralMap.set(source, (referralMap.get(source) || 0) + 1);
      });

      const referralStats = Array.from(referralMap, ([source, count]) => ({
        source,
        count,
      })).sort((a, b) => b.count - a.count);

      const topReferralSource = referralStats[0]?.source || "N/A";

      /* =========================
          SAVE STATE
      ========================= */
      set({
        loading: false,
        upcomingAppointments: appointments.filter(
          (a) => a.status !== "cancelled",
        ),
        pendingAppointments,
        kpis: {
          totalRevenue,
          totalAppointments,
          cancellationRate:
            totalAppointments === 0
              ? 0
              : (cancelledCount / totalAppointments) * 100,
          avgAppointmentTime: 45,
          topReferralSource,
          pendingCount,
        },
        charts: {
          revenueByDay,
          topServices,
          appointmentStatus,
          referralStats,
        },
      });
    } catch (err) {
      console.error("Analytics fetch failed", err);
      toast.error("Failed to fetch monthly analytics");
      set({ loading: false });
    }
  },
}));

"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // Added for redirection
import { SectionCards } from "@/components/section-cards";
import { useDashboardStore } from "@/app/dashboard/dashboard-store";
import { usePatientStore } from "@/app/store/patientStore";
import AnalyticsPage from "./analytics/page";
import { useBranchStore } from "@/app/store/branch-store";
import { BirthdayList } from "./BirthdayList";
import { DashboardSkeleton } from "./DashboardSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Badge,
  CalendarDays,
  Clock,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/user-stores"; // Import to check permissions

export default function DashboardPage() {
  const router = useRouter();
  const { currentBranchId, branches } = useBranchStore();
  const { user, userDoc, loading: authLoading } = useAuthStore();
  const { users, isLoading: usersLoading, fetchUsers } = useUserStore();

  const {
    fetchTodaySummary,
    loading: dashboardLoading,
    appointmentsToday,
    remindersToday,
    totalSalesToday,
    transactionsToday,
    expensesToday,
    lowStockList,
    lowStockCount,
    outOfStockCount,
    outOfStockList,
    expensesListToday,
    appointmentsListToday,
  } = useDashboardStore();

  const {
    patients,
    fetchPatients,
    loading: patientsLoading,
  } = usePatientStore();

  // --- 1. PERMISSION CHECK LOGIC ---
  const dbUser = useMemo(
    () => users.find((u) => u.accountId === user?.$id || u.$id === user?.$id),
    [users, user],
  );

  useEffect(() => {
    // If data is done loading, verify if they should be here
    if (!authLoading && !usersLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (dbUser) {
        const isSuperAdmin = dbUser.role === "superadmin";
        const hasDashboardAccess =
          dbUser.permissions?.includes("access_dashboard");

        if (!isSuperAdmin && !hasDashboardAccess) {
          // Find their first allowed section if they can't see the dashboard
          const permissionToRouteMap: Record<string, string> = {
            access_appointments: "/dashboard/appointments",
            access_patients: "/dashboard/patients",
            access_inventory: "/dashboard/inventory",
            access_expenses: "/dashboard/expenses",
            access_sales_reports: "/dashboard/sales-reports",
            access_settings: "/dashboard/settings",
          };

          const firstAllowed = Object.keys(permissionToRouteMap).find((p) =>
            dbUser.permissions?.includes(p),
          );

          router.replace(
            firstAllowed
              ? permissionToRouteMap[firstAllowed]
              : "/pending-approval",
          );
        }
      }
    }
  }, [authLoading, usersLoading, dbUser, user, router]);

  // --- 2. DATA INITIALIZATION ---
  useEffect(() => {
    if (users.length === 0) fetchUsers();

    fetchTodaySummary(currentBranchId || "");
    if (currentBranchId) {
      fetchPatients(currentBranchId);
    }
    const i = setInterval(
      () => fetchTodaySummary(currentBranchId || ""),
      5 * 60 * 1000,
    );
    return () => clearInterval(i);
  }, [
    currentBranchId,
    fetchUsers,
    fetchTodaySummary,
    fetchPatients,
    users.length,
  ]);

  // --- 3. MEMOIZED ANALYTICS ---
  const currentBranch = useMemo(
    () => branches.find((b) => b.$id === currentBranchId),
    [branches, currentBranchId],
  );

  const birthdayCount = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    return patients.filter((p) => {
      if (!p.birthdate) return false;
      const bday = new Date(p.birthdate);
      return bday.getMonth() === currentMonth && bday.getDate() === currentDate;
    }).length;
  }, [patients]);

  const newPatientsThisMonth = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return patients.filter((p) => {
      if (!p.$createdAt) return false;
      const registrationDate = new Date(p.$createdAt);
      return (
        registrationDate.getMonth() === currentMonth &&
        registrationDate.getFullYear() === currentYear
      );
    });
  }, [patients]);

  const patientsWithBalance = useMemo(
    () => patients.filter((p) => (p.remainingBal || 0) > 0).length,
    [patients],
  );

  // --- 4. RENDER GUARDS ---

  // Show skeleton during initial load
  if (authLoading || usersLoading || dashboardLoading || patientsLoading) {
    return <DashboardSkeleton />;
  }

  // Prevent UI flash if user has no access (while router.replace is processing)
  if (
    dbUser &&
    dbUser.role !== "superadmin" &&
    !dbUser.permissions?.includes("access_dashboard")
  ) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-8">
      {/* --- MODERN WELCOME HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
            <Sparkle className="size-4" />
            Clinic Overview
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              {userDoc?.name || "User"}
            </span>
            !
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0">
              <ShieldCheck className="size-3 mr-1" />
              {userDoc?.role || "Staff"}
            </Badge>
            <p className="text-slate-500 font-medium">
              at{" "}
              <span className="text-slate-900 font-bold">
                {currentBranch?.name || "the clinic"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-3 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <CalendarDays className="size-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Today's Date
              </span>
              <span className="text-sm font-bold text-slate-900">
                {format(new Date(), "MMMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <SectionCards
            appointmentsToday={appointmentsToday}
            salesToday={totalSalesToday}
            expensesToday={expensesToday}
            lowStockCount={lowStockCount}
            lowStockList={lowStockList}
            outOfStockCount={outOfStockCount}
            outOfStockList={outOfStockList}
            birthdayCount={birthdayCount}
            newPatientsThisMonth={newPatientsThisMonth}
            totalPatients={patients.length}
            patientsWithBalance={patientsWithBalance}
            transactionsToday={transactionsToday}
            expensesListToday={expensesListToday}
            appointmentsListToday={appointmentsListToday}
          />

          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Performance Analytics
            </h2>
            <AnalyticsPage />
          </section>
        </div>

        <aside className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                🎂 Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <BirthdayList patients={patients} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-indigo-600 text-white p-6 shadow-lg relative overflow-hidden">
            <Lightbulb className="absolute -right-4 -bottom-4 size-24 opacity-10" />
            <h4 className="font-bold text-lg mb-2">Inventory Insight</h4>
            <p className="text-indigo-100 text-sm mb-4">
              There are {lowStockCount} items currently low on stock.
            </p>
            <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-xl text-xs">
              Generate Order
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

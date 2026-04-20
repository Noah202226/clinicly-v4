"use client";

import {
  IconGift,
  IconTrendingDown,
  IconTrendingUp,
  IconUserPlus,
  IconWallet,
  IconCalendarEvent,
  IconUsers,
  IconCash,
  IconArrowRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { LowStockModal } from "@/app/dashboard/inventory/components/LowStockModal";
import {
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PendingBalancesModal } from "@/app/dashboard/analytics/components/PendingBalancesModal";
import { NewPatientsModal } from "@/app/dashboard/analytics/components/NewPatientsModal";
import Link from "next/link";
import { TodaySalesModal } from "@/app/dashboard/analytics/components/TodaySalesModal";
import { TodayExpensesModal } from "@/app/dashboard/analytics/components/TodayExpensesModal";
import { TodayAppointmentsModal } from "@/app/dashboard/analytics/components/TodayAppointmentsModal";
import { TodayBirthdaysModal } from "@/app/dashboard/analytics/components/TodayBirthdaysModal";

interface SectionCardsProps {
  appointmentsToday: number;
  salesToday: number;
  expensesToday: number;
  lowStockCount: number;
  lowStockList: any[];
  outOfStockCount: number;
  outOfStockList: any[];
  birthdayCount: number;
  newPatientsThisMonth: any[];
  totalPatients: number;
  patientsWithBalance: number;
  transactionsToday: any[];
  expensesListToday: any[];
  appointmentsListToday: any[];
}

export function SectionCards({
  appointmentsToday,
  salesToday,
  expensesToday,
  lowStockCount,
  lowStockList,
  outOfStockCount,
  outOfStockList,
  birthdayCount,
  newPatientsThisMonth,
  totalPatients,
  patientsWithBalance,
  transactionsToday,
  expensesListToday,
  appointmentsListToday,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-7">
      {/* 1. Appointments - Solid Blue Gradient */}
      <TodayAppointmentsModal appointments={appointmentsListToday}>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-blue-100 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    Appointments Today
                  </CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                    {appointmentsToday}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconCalendarEvent className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-blue-50 text-xs font-medium flex justify-between items-center relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm">
                Daily Schedule
              </span>
            </CardFooter>
          </Card>
        </div>
      </TodayAppointmentsModal>

      {/* 2. Sales Today - Solid Emerald Gradient */}
      <TodaySalesModal transactions={transactionsToday}>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-emerald-100 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    Sales Today
                  </CardDescription>
                  <CardTitle className="text-3xl font-extrabold text-white tracking-tight">
                    ₱{salesToday.toLocaleString()}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconCash className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-emerald-50 text-xs font-medium flex justify-between items-center relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <IconTrendingUp className="size-3.5" /> Gross Revenue
              </span>
            </CardFooter>
          </Card>
        </div>
      </TodaySalesModal>

      {/* 3. Expenses - Solid Rose Gradient */}
      <TodayExpensesModal expenses={expensesListToday}>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-rose-100 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    Expenses Today
                  </CardDescription>
                  <CardTitle className="text-3xl font-extrabold text-white tracking-tight">
                    ₱{expensesToday.toLocaleString()}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconTrendingDown className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-rose-50 text-xs font-medium flex justify-between items-center relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <ArrowDownRight className="size-3.5" /> Outflow
              </span>
            </CardFooter>
          </Card>
        </div>
      </TodayExpensesModal>

      {/* 4. Birthdays - Solid Pink Gradient */}
      <TodayBirthdaysModal>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-pink-100 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    Birthdays
                  </CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                    {birthdayCount}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconGift className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-pink-50 text-xs font-medium relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm">
                Celebrating today
              </span>
            </CardFooter>
          </Card>
        </div>
      </TodayBirthdaysModal>

      {/* 5. New Patients - Solid Indigo Gradient */}
      <NewPatientsModal patients={newPatientsThisMonth}>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-indigo-100 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    New Patients
                  </CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                    {newPatientsThisMonth.length}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconUserPlus className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-indigo-50 text-xs font-medium flex justify-between items-center relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <ArrowUpRight className="size-3.5" />{" "}
                {format(new Date(), "MMM")} Growth
              </span>
            </CardFooter>
          </Card>
        </div>
      </NewPatientsModal>

      {/* 6. Total Patients - Deep Slate Gradient */}
      <Link href="/dashboard/patients" className="block h-full min-h-40">
        <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
          <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-all duration-500 z-0" />

          <CardHeader className="pb-2 flex-1 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription className="text-slate-300 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                  Total Patients
                </CardDescription>
                <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                  {totalPatients}
                </CardTitle>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 group-hover:scale-110 transition-all duration-300">
                <IconUsers className="size-6" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="pt-0 text-slate-300 text-xs font-medium flex items-center justify-between relative z-10">
            <span className="bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
              Lifetime Database
            </span>
          </CardFooter>
        </Card>
      </Link>

      {/* 7. Pending Balances - Solid Orange Gradient */}
      <PendingBalancesModal>
        <div className="h-full min-h-40">
          <Card className="relative h-full overflow-hidden border-none bg-linear-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-orange-50 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                    Pending Balances
                  </CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                    {patientsWithBalance}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <IconWallet className="size-6" />
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 text-orange-50 text-xs font-medium flex justify-between items-center relative z-10">
              <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <AlertCircle className="size-3.5" /> Debtors List
              </span>
            </CardFooter>
          </Card>
        </div>
      </PendingBalancesModal>

      {/* 8. Inventory Alerts - Red/Solid */}
      <LowStockModal>
        <div className="h-full min-h-40">
          <Card
            className={`relative h-full overflow-hidden border-none shadow-lg transition-all duration-300 cursor-pointer group flex flex-col rounded-3xl ${
              outOfStockCount > 0
                ? "bg-linear-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/40"
                : "bg-linear-to-br from-slate-600 to-slate-800 shadow-slate-800/20 hover:shadow-slate-800/40"
            }`}
          >
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500 z-0" />

            <CardHeader className="pb-2 flex-1 relative z-10">
              <div className="flex justify-between items-start">
                <CardDescription className="text-white/80 font-bold uppercase text-[11px] tracking-widest mb-1.5">
                  Inventory Alerts
                </CardDescription>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-300">
                  {outOfStockCount > 0 ? (
                    <AlertCircle className="size-6 animate-pulse" />
                  ) : (
                    <Package className="size-6" />
                  )}
                </div>
              </div>

              <div className="flex items-end gap-5 mt-1 text-white">
                <div className="flex flex-col">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${outOfStockCount > 0 ? "text-red-200 animate-pulse" : "text-green-400"}`}
                  >
                    {outOfStockCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase opacity-70">
                    Out
                  </span>
                </div>
                <div className="flex flex-col border-l border-white/20 pl-4">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${lowStockCount > 0 ? "text-red-200 animate-pulse" : "text-green-400"}`}
                  >
                    {lowStockCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase opacity-70">
                    Low
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-0 flex gap-2 relative z-10">
              <Badge
                className={`bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm ${outOfStockCount > 0 ? "bg-red-600/30 text-red-100 hover:bg-red-600/50 animate-pulse" : "bg-green-600/30 text-green-100 hover:bg-green-600/50"}`}
              >
                {outOfStockCount > 0 ? "CRITICAL" : "ALL GOOD"}
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </LowStockModal>
    </div>
  );
}

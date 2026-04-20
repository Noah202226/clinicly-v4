"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Megaphone,
  CalendarCheck,
  User,
  Clock,
  AlertCircle,
  ChevronRight,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";
import { useBranchStore } from "@/app/store/branch-store";
import { Badge } from "@/components/ui/badge";

export function KpiCards() {
  const { currentBranchId } = useBranchStore();
  const { kpis, upcomingAppointments, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(currentBranchId || "");
  }, [fetchAnalytics, currentBranchId]);

  return (
    <div className="space-y-8">
      {/* --- TOP ROW: KPI METRICS --- */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Requests - Warning Style */}
        <Card className="relative overflow-hidden border-none shadow-sm bg-white ring-1 ring-orange-100 border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                Pending Requests
              </CardTitle>
              <AlertCircle className="size-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {kpis.pendingCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 py-0 h-5"
              >
                Action Required
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Appointments - Info Style */}
        <Card className="relative overflow-hidden border-none shadow-sm bg-white ring-1 ring-blue-100 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Total Appointments
              </CardTitle>
              <CalendarCheck className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {kpis.totalAppointments}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              All-time bookings
            </p>
          </CardContent>
        </Card>

        {/* Marketing Lead Source - Success Style */}
        <Card className="relative overflow-hidden border-none shadow-sm bg-white ring-1 ring-emerald-100 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Top Lead Source
              </CardTitle>
              <Megaphone className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 truncate">
              {kpis.topReferralSource || "No Data"}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 font-bold">
              <TrendingUp className="size-3" />
              Highest conversion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECOND ROW: UPCOMING APPOINTMENTS --- */}
      <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 px-6 py-5 border-b border-slate-100">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Stethoscope className="size-5 text-blue-600" />
              </div>
              Appointment Schedule
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Next 48 hours activity
            </CardDescription>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1">
            View Full Calendar
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto scrollbar-hide">
            {upcomingAppointments?.length > 0 ? (
              upcomingAppointments.map((appt) => (
                <div
                  key={appt.$id}
                  className="group flex items-center justify-between p-5 hover:bg-blue-50/30 transition-all cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-white transition-colors">
                        <User className="size-5 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white size-3.5 rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {appt.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                        {appt.serviceName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-slate-700">
                        <Clock className="size-3.5 text-blue-500" />
                        {appt.time}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                        {format(parseISO(appt.date), "EEE, MMM dd")}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <CalendarCheck className="size-8 text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-bold">Clear Schedule</h3>
                <p className="text-slate-400 text-sm max-w-[200px] mt-1">
                  There are no appointments scheduled for the next few days.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

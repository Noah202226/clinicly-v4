"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/app/store/analytics-store";

import { KpiCards } from "./components/kpi-cards";
import { RevenueSection } from "./components/revenue-section";
import { ServiceSection } from "./components/service-section";
import { AppointmentSection } from "./components/appointment-section";
import { ReferralSection } from "./components/referral-section";
import { useBranchStore } from "@/app/store/branch-store";
import { AnalyticsHeader } from "./components/AnalyticsHeader";

export default function AnalyticsPage() {
  const { currentBranchId } = useBranchStore();
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics(currentBranchId || "");
  }, [fetchAnalytics, currentBranchId]);

  return (
    <div className="space-y-6 p-6">
      <AnalyticsHeader />
      <KpiCards />

      {/* Grid for Revenue, Services, and Referrals */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueSection />
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceSection />
        <AppointmentSection />
        <ReferralSection />
      </div>
    </div>
  );
}

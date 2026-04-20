"use client";

import { useEffect, useMemo } from "react";
import { useDashboardStore } from "@/app/dashboard/dashboard-store";
import { usePatientStore } from "@/app/store/patientStore"; // Ensure path is correct
import { SectionCards } from "@/components/section-cards";
import { useBranchStore } from "../store/branch-store";

export function DashboardKPIs() {
  const { currentBranchId } = useBranchStore(); // If you use branch filtering
  const {
    fetchTodaySummary,
    appointmentsToday,
    remindersToday,
    totalSalesToday,
    transactionsToday,
    expensesToday,
    lowStockCount,
    lowStockList,
    outOfStockCount,
    outOfStockList,
    expensesListToday,
    appointmentsListToday,
  } = useDashboardStore();

  const { patients, fetchPatients } = usePatientStore();

  useEffect(() => {
    fetchTodaySummary(currentBranchId || "");
    // Only fetch patients if branchId is available
    if (currentBranchId) {
      fetchPatients(currentBranchId);
    }
  }, [currentBranchId]);

  // Logic to calculate birthdays today
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

  // Logic to calculate new patients this month
  const newPatientsCount = useMemo(() => {
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
    }); // Get the count (number)
  }, [patients]);

  const patientsWithBalance = patients.filter(
    (p) => (p.remainingBal || 0) > 0,
  ).length;

  return (
    <SectionCards
      patientsWithBalance={patientsWithBalance}
      totalPatients={patients.length}
      birthdayCount={birthdayCount}
      appointmentsToday={appointmentsToday}
      expensesToday={expensesToday}
      lowStockCount={lowStockCount}
      lowStockList={lowStockList}
      outOfStockList={outOfStockList}
      outOfStockCount={outOfStockCount}
      // remindersToday={remindersToday}
      salesToday={totalSalesToday}
      transactionsToday={transactionsToday}
      newPatientsThisMonth={newPatientsCount} // This fix satisfies the required prop
      expensesListToday={expensesListToday}
      appointmentsListToday={appointmentsListToday}
    />
  );
}

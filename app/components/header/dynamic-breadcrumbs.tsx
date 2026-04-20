// components/header/dynamic-breadcrumbs.tsx

"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import React, { useMemo } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useUserStore } from "@/app/store/user-stores";

// Function to convert a URL segment (e.g., "patient-records") into a readable string
const segmentToTitle = (segment: string) => {
  if (segment === "") return "Dashboard";
  // Convert kebab-case to Title Case
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { users } = useUserStore();

  // --- 1. Kuhanin ang user data at permissions ---
  const dbUser = useMemo(
    () => users.find((u) => u.accountId === user?.$id || u.$id === user?.$id),
    [users, user],
  );

  // --- 2. Logic para makuha ang tamang "Home/Dashboard" URL nila ---
  const dynamicDashboardUrl = useMemo(() => {
    if (!dbUser) return "/dashboard";
    if (
      dbUser.role === "superadmin" ||
      dbUser.permissions?.includes("access_dashboard")
    ) {
      return "/dashboard";
    }

    const permissionToRouteMap: Record<string, string> = {
      access_appointments: "/dashboard/appointments",
      access_patients: "/dashboard/patients",
      access_inventory: "/dashboard/inventory",
      access_expenses: "/dashboard/expenses",
      access_sales_reports: "/dashboard/sales",
      access_settings: "/dashboard/settings",
    };

    const firstRoute = Object.keys(permissionToRouteMap).find((p) =>
      dbUser.permissions?.includes(p),
    );

    return firstRoute ? permissionToRouteMap[firstRoute] : "/pending-approval";
  }, [dbUser]);

  // Split the path into segments, filtering out the leading empty string
  const segments = pathname.split("/").filter((segment) => segment);

  // The cumulative path used for the 'href' of each link
  let cumulativePath = "";

  const breadcrumbItems = segments.map((segment, index) => {
    cumulativePath += `/${segment}`;
    const title = segmentToTitle(segment);
    const isLast = index === segments.length - 1;

    // 🔥 SMART LINK LOGIC: Kung ang segment ay "dashboard" at kinlick nila, idaan sa dynamic URL
    const targetUrl =
      segment === "dashboard" ? dynamicDashboardUrl : cumulativePath;

    return (
      <React.Fragment key={cumulativePath}>
        <BreadcrumbItem>
          {isLast ? (
            // The current page (last item)
            <BreadcrumbPage>{title}</BreadcrumbPage>
          ) : (
            // A link to a parent page
            <BreadcrumbLink asChild>
              <Link href={targetUrl}>{title}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* Only show separator if it's NOT the last item */}
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  if (segments.length === 0) {
    // Handle the root path '/' case by showing only 'Dashboard'
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
}

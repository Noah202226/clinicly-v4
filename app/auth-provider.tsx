"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "./store/useAuthStore";
import { useUserStore } from "./store/user-stores";
import { Toaster } from "sonner";

const permissionToRouteMap: Record<string, string> = {
  access_dashboard: "/dashboard",
  access_appointments: "/dashboard/appointments",
  access_patients: "/dashboard/patients",
  access_inventory: "/dashboard/inventory",
  access_expenses: "/dashboard/expenses",
  access_sales_reports: "/dashboard/sales",
  access_settings: "/dashboard/settings",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const { users, fetchUsers, isLoading: usersLoading } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initial Fetch
  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, [checkAuth, fetchUsers]);

  // 2. Master Redirect Logic
  useEffect(() => {
    if (authLoading || usersLoading) return;

    const isPublicPath = pathname === "/login" || pathname === "/signup";

    if (!user) {
      if (!isPublicPath) router.replace("/login");
      return;
    }

    const dbUser = users.find(
      (u) => u.accountId === user.$id || u.$id === user.$id,
    );
    if (!dbUser) return;

    if (!dbUser.isActive && pathname !== "/pending-approval") {
      router.replace("/pending-approval");
      return;
    }

    // Kung nasa Root (/) o Login page pero logged in na, hanapin ang tamang landing page
    if (pathname === "/" || isPublicPath) {
      if (
        dbUser.role === "superadmin" ||
        dbUser.permissions?.includes("access_dashboard")
      ) {
        router.replace("/dashboard");
      } else {
        const firstRoute = Object.keys(permissionToRouteMap).find((p) =>
          dbUser.permissions?.includes(p),
        );

        console.log("User Permissions:", dbUser.permissions);
        console.log(
          "Redirecting to:",
          firstRoute ? permissionToRouteMap[firstRoute] : "/pending-approval",
        );

        router.replace(
          firstRoute ? permissionToRouteMap[firstRoute] : "/pending-approval",
        );
      }
    }
  }, [user, users, authLoading, usersLoading, pathname, router]);

  if (authLoading || usersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* Iyong Stylish Loading Screen */}
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}

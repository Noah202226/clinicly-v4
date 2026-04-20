"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PremiumClinicFAB } from "./ClinicTaskFAB";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/user-stores";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// The children prop will be the content from the page.tsx files
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {/* The dynamic content from the selected route renders here! */}
            {children}
            <PremiumClinicFAB />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Facebook, Bell, LayoutDashboard } from "lucide-react";
import LiveClock from "@/app/components/live-clock";
import { DynamicBreadcrumbs } from "@/app/components/header/dynamic-breadcrumbs";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/80 backdrop-blur-md transition-all ease-in-out">
      <div className="flex w-full items-center justify-between px-4 sm:px-6">
        {/* LEFT SECTION: Navigation & Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <SidebarTrigger className="h-8 w-8 hover:bg-white hover:shadow-sm dark:hover:bg-slate-700 transition-all" />
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-6 md:block opacity-50"
          />

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-indigo-600 md:hidden" />
              <DynamicBreadcrumbs />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Global Info & Actions */}
        <div className="flex items-center gap-2 lg:gap-6">
          {/* Real-time Status Section */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex flex-col items-end leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Time
              </span>
              <LiveClock />
            </div>
            <Separator orientation="vertical" className="h-8 opacity-50" />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="group hidden h-10 gap-2 rounded-xl px-4 font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 sm:flex"
            >
              <a
                href="https://web.facebook.com/EgargueDentalClinic"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="hidden lg:inline">Clinic Page</span>
              </a>
            </Button>

            {/* Notification Placeholder - Matching the Dashboard's Card Icon style */}
            {/* <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-slate-200 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              <Bell className="h-5 w-5" />
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
}

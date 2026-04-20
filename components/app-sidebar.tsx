"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconUser,
  IconSettings,
  IconUsers,
  IconCalendar,
  IconMoneybagMinus,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

import { useAuthStore } from "@/app/store/useAuthStore";
import { useUserStore } from "@/app/store/user-stores";
import { useMemo } from "react";

const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard", // This is the path to your app/dashboard/page.tsx
      icon: IconDashboard,
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments", // This is the path to your app/dashboard/analytics/page.tsx
      icon: IconCalendar,
    },
    {
      title: "Patient Records",
      url: "/dashboard/patients", // This is the path to your app/dashboard/patients/page.tsx
      icon: IconListDetails,
    },
    {
      title: "Inventory",
      url: "/dashboard/inventory", // This is the path to your app/dashboard/inventory/page.tsx
      icon: IconFolder,
    },
    {
      title: "Expenses",
      url: "/dashboard/expenses", // This is the path to your app/dashboard/analytics/page.tsx
      icon: IconMoneybagMinus,
    },
    {
      title: "Sales Reports",
      url: "/dashboard/sales-reports", // This is the path to your app/dashboard/sales-reports/page.tsx
      icon: IconUsers,
    },
    // {
    //   title: "Analytics",
    //   url: "/dashboard/analytics", // This is the path to your app/dashboard/analytics/page.tsx
    //   icon: IconChartBar,
    // },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  dentists: [
    {
      name: "Dra 1",
      url: "#",
      icon: IconUser,
    },
    {
      name: "Doc 2",
      url: "#",
      icon: IconUser,
    },
    {
      name: "Dentist 3",
      url: "#",
      icon: IconUser,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const { user } = useAuthStore(); // Just to trigger re-render on auth changes if needed
  const { users } = useUserStore(); // Just to trigger re-render on user data changes if needed

  const dbUser = useMemo(
    () => users.find((u) => u.accountId === user?.$id || u.$id === user?.$id),
    [users, user],
  );

  // 1. Dynamic Dashboard URL Logic
  const getDynamicDashboardUrl = () => {
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
  };

  // 2. Filter NavMain Items base sa permissions
  const navMain = useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: getDynamicDashboardUrl(), // Dynamic URL!
        icon: IconDashboard,
        isActive: true,
        permission: "access_dashboard",
      },
      {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: IconCalendar,
        permission: "access_appointments",
      },
      {
        title: "Patient Records",
        url: "/dashboard/patients",
        icon: IconUser,
        permission: "access_patients",
      },
      {
        title: "Inventory",
        url: "/dashboard/inventory", // This is the path to your app/dashboard/inventory/page.tsx
        icon: IconFolder,
        permission: "access_inventory",
      },
      {
        title: "Expenses",
        url: "/dashboard/expenses", // This is the path to your app/dashboard/analytics/page.tsx
        icon: IconMoneybagMinus,
        permission: "access_expenses",
      },
      {
        title: "Sales Reports",
        url: "/dashboard/sales-reports", // This is the path to your app/dashboard/sales-reports/page.tsx
        icon: IconUsers,
        permission: "access_sales_reports",
      },
    ];

    // Kung superadmin, ipakita lahat. Kung hindi, i-filter base sa dbUser.permissions
    if (dbUser?.role === "superadmin") return items;

    return items.filter(
      (item) =>
        item.title === "Dashboard" || // Laging ipakita ang Dashboard but with dynamic link
        dbUser?.permissions?.includes(item.permission),
    );
  }, [dbUser]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                {/* <IconInnerShadowTop className="size-5!" /> */}
                <img src="/Egargue.ico" alt="" className="w-10" />
                <span className="text-base font-semibold">
                  Egargue Dental Group
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} currentPath={pathname} />
        {/* <NavDocuments items={data.dentists} /> */}
        <NavSecondary
          items={data.navSecondary}
          currentPath={pathname}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AnimatedTooltip } from "./ui/animated-tooltip";

// 1. Import your stores instead of useRole
import { useAuthStore } from "@/app/store/useAuthStore";
import { useUserStore } from "@/app/store/user-stores";

interface NavItem {
  title: string;
  url: string;
  icon: Icon;
}

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  items: NavItem[];
  currentPath: string;
}

export function NavSecondary({
  items,
  currentPath,
  ...props
}: NavSecondaryProps) {
  // 2. Fetch user data from your stores
  const { user: authUser } = useAuthStore();
  const { users, fetchUsers } = useUserStore();

  // Bulletproof ID Match
  const dbUser = users.find(
    (u) => u.$id === authUser?.$id || u.accountId === authUser?.$id,
  );

  const userPermissions = dbUser?.permissions || [];
  const isUserActive = dbUser ? (dbUser.isActive ?? true) : false;
  const userRole = dbUser?.role;

  // Make sure users are fetched (in case NavSecondary renders first)
  React.useEffect(() => {
    if (users.length === 0) fetchUsers();
  }, [fetchUsers, users.length]);

  // 3. Define the permission map for secondary links
  const permissionMap: Record<string, string> = {
    Settings: "access_settings",
  };

  const hasAccess = (item: NavItem) => {
    if (!dbUser) return false; // Prevent flickering while loading
    if (!isUserActive) return false;
    if (userRole === "owner") return true;

    const requiredPermission = permissionMap[item.title];
    if (!requiredPermission) return true; // Allows items like "Get Help"

    return userPermissions.includes(requiredPermission);
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.url;
            const canAccess = hasAccess(item);
            const disabled = !canAccess;

            const tooltipText = disabled
              ? "You do not have permission"
              : item.title;

            return (
              <SidebarMenuItem key={item.title}>
                <AnimatedTooltip content={tooltipText} disabled={!disabled}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "h-11 px-3 rounded-xl transition-all duration-200 ease-in-out font-semibold",
                      // ACTIVE STATE: Vibrant Indigo Background + White Text
                      "data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-indigo-200",
                      // HOVER WHILE ACTIVE: Darker Indigo (Para hindi mag-white!)
                      "hover:data-[active=true]:bg-indigo-700 hover:data-[active=true]:text-white",
                      // INACTIVE STATE: Subtle Grey + Indigo Hover
                      "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
                      // DISABLED STATE
                      disabled &&
                        "opacity-50 cursor-not-allowed pointer-events-none",
                    )}
                  >
                    <Link
                      href={disabled ? "#" : item.url}
                      onClick={(e) => {
                        if (disabled) e.preventDefault();
                      }}
                      className="flex items-center gap-3 w-full group"
                    >
                      <item.icon
                        size={20}
                        stroke={2.5}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-indigo-600",
                          disabled && "text-slate-300",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate tracking-tight",
                          isActive
                            ? "text-white"
                            : "text-slate-600 group-hover:text-indigo-600",
                          disabled && "text-slate-400",
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </AnimatedTooltip>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

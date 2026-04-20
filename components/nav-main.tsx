"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconVectorBezierArc, IconAlertTriangle } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import React from "react";

import { useBranchStore } from "@/app/store/branch-store";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useUserStore } from "@/app/store/user-stores";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavMainProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[];
  currentPath: string;
}

export function NavMain({
  items,
  currentPath,
  className,
  ...props
}: NavMainProps) {
  const { user: authUser } = useAuthStore();
  const { users, fetchUsers, isLoading: isUsersLoading } = useUserStore();
  const {
    currentBranchId,
    setBranchId,
    branches,
    isLoading: isBranchesLoading,
    error,
    fetchBranches,
  } = useBranchStore();

  const dbUser = users.find(
    (u) => u.$id === authUser?.$id || u.accountId === authUser?.$id,
  );
  const isUserActive = dbUser ? (dbUser.isActive ?? true) : false;
  const userRole = dbUser?.role;
  const userPermissions = dbUser?.permissions || [];

  // Safe extraction of user's branches handling both new array and legacy string formats
  const userBranchIds = React.useMemo(() => {
    if (!dbUser) return [];
    if (Array.isArray(dbUser.branchIds) && dbUser.branchIds.length > 0)
      return dbUser.branchIds;
    if (dbUser.branchId) return [dbUser.branchId];
    return [];
  }, [dbUser]);

  React.useEffect(() => {
    if (users.length === 0) fetchUsers();
    fetchBranches();
  }, [fetchUsers, users.length, fetchBranches]);

  // 1. FILTERED BRANCHES LOGIC
  const accessibleBranches = React.useMemo(() => {
    // Both owner and superadmin should see all branches
    if (userRole === "owner" || userRole === "superadmin") return branches;

    if (userBranchIds.length > 0) {
      return branches.filter((b) => userBranchIds.includes(b.$id));
    }
    return [];
  }, [branches, userRole, userBranchIds]);

  // 2. FORCED AUTO-SELECT LOGIC
  // Ito ang "magic" para magbago agad ang Dashboard nila pagka-login
  React.useEffect(() => {
    // Stop if branches aren't loaded or there are no branches to select
    if (isBranchesLoading || accessibleBranches.length === 0) return;

    // Check if the current selection is still valid for this specific user
    const isCurrentValid =
      currentBranchId &&
      accessibleBranches.some((b) => b.$id === currentBranchId);

    if (!isCurrentValid) {
      // Auto-select the first valid branch from the accessible list
      // This handles both "one branch only" and "multiple branches" scenarios
      setBranchId(accessibleBranches[0].$id);
    }
  }, [
    accessibleBranches,
    userRole,
    currentBranchId,
    setBranchId,
    userBranchIds,
    isBranchesLoading,
  ]);

  const permissionMap: Record<string, string> = {
    Dashboard: "access_dashboard",
    Appointments: "access_appointments",
    "Patient Records": "access_patients",
    Inventory: "access_inventory",
    Expenses: "access_expenses",
    "Sales Reports": "access_sales_reports",
    Settings: "access_settings",
  };

  const hasAccess = (item: NavItem) => {
    if (!dbUser || !isUserActive) return false;
    if (userRole === "owner" || userRole === "superadmin") return true;
    const requiredPermission = permissionMap[item.title];
    if (!requiredPermission) return true;
    return (
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes(`access_${requiredPermission}`)
    );
  };

  const renderBranchSelector = () => {
    if (isBranchesLoading)
      return <Skeleton className="w-full h-12 rounded-xl" />;

    if (error)
      return (
        <Alert className="border-red-200 bg-red-50 p-2 rounded-xl">
          <IconAlertTriangle className="size-4 text-red-500" />
          <AlertDescription className="text-[10px] text-red-600 font-medium">
            Failed to load branches.
          </AlertDescription>
        </Alert>
      );

    if (accessibleBranches.length === 0 && !isBranchesLoading) {
      return (
        <div className="px-2 py-3 border border-amber-200 bg-amber-50 rounded-xl flex items-center gap-2">
          <IconAlertTriangle className="size-4 text-amber-500 shrink-0" />
          <span className="text-[10px] font-bold text-amber-700 leading-tight">
            No Branch Assigned
          </span>
        </div>
      );
    }

    // Allow multiple assigned branches for staff/admin to be selected from the dropdown
    const canSwitchBranch =
      userRole === "owner" ||
      userRole === "superadmin" ||
      accessibleBranches.length > 1;

    return (
      <Select
        value={currentBranchId || ""}
        onValueChange={(value) => setBranchId(value)}
        disabled={!canSwitchBranch}
      >
        <SelectTrigger
          className={cn(
            "h-12 w-full rounded-xl border-slate-200 bg-white shadow-sm transition-all focus:ring-indigo-500",
            canSwitchBranch
              ? "hover:border-indigo-300 hover:bg-slate-50 cursor-pointer"
              : "opacity-100 cursor-default", // Non-clickable but high visibility
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <IconVectorBezierArc className="size-4 text-indigo-600" />
            </div>
            <div className="flex flex-col items-start truncate leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {canSwitchBranch ? "Switch Branch" : "Your Branch"}
              </span>
              <SelectValue
                placeholder="Select branch"
                className="text-sm font-semibold text-slate-700"
              />
            </div>
          </div>
        </SelectTrigger>

        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
          <SelectGroup>
            <SelectLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {userRole === "owner" || userRole === "superadmin"
                ? "Operation Branches"
                : "Assigned Branches"}
            </SelectLabel>
            {accessibleBranches.map((branch) => (
              <SelectItem
                key={branch.$id}
                value={branch.$id}
                className="rounded-md cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 my-0.5"
              >
                <span className="font-semibold text-sm">{branch.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };

  if (isUsersLoading || !dbUser) {
    return (
      <SidebarGroup className={cn("px-4 py-2", className)}>
        <SidebarGroupContent className="space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl opacity-60" />
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className={cn("px-3 py-2", className)} {...props}>
      <div className="mb-6 px-1">{renderBranchSelector()}</div>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            if (!hasAccess(item)) return null;

            let isActive = currentPath.startsWith(item.url);
            if (item.url === "/dashboard") {
              isActive = currentPath === item.url || currentPath === "/";
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "h-11 px-3 rounded-xl transition-all duration-200 ease-in-out font-semibold",
                    "data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-indigo-200",
                    "hover:data-[active=true]:bg-indigo-700 hover:data-[active=true]:text-white",
                    "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
                  )}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                  >
                    <item.icon
                      size={20}
                      stroke={2.5}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-indigo-600",
                      )}
                    />
                    <span className="truncate tracking-tight">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

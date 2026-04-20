"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { CustomUser } from "@/app/types/appwrite-types";
import { cn } from "@/lib/utils";

export function NavUser() {
  const { user, loading, handleLogout } = useAuthStore();
  const typedUser = user as CustomUser;

  const { isMobile } = useSidebar();
  const router = useRouter();

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 px-2 py-2 w-full animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-2 w-28 bg-slate-100 rounded" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!typedUser) {
    return (
      <div className="p-4 text-xs font-semibold text-red-500 bg-red-50 rounded-lg mx-2 border border-red-100">
        Authentication Failed
      </div>
    );
  }

  const userName = typedUser.name || "Appwrite User";
  const userEmail = typedUser.email;
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AU";

  const userAvatarUrl = typedUser.prefs?.avatarUrl || "/Egargue.ico";

  const onLogout = async () => {
    await handleLogout();
    router.push("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "w-full rounded-xl transition-all duration-200 ease-in-out h-12",
                "hover:bg-indigo-50 hover:text-indigo-600 group",
                "data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-600",
              )}
            >
              <Avatar className="h-9 w-9 rounded-lg border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={userAvatarUrl} alt={userName} />
                <AvatarFallback className="rounded-lg bg-indigo-600 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                <span className="truncate font-semibold text-slate-700 group-hover:text-indigo-700">
                  {userName}
                </span>
                <span className="text-slate-400 truncate text-xs font-medium uppercase tracking-wider">
                  {userEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-slate-400 group-hover:text-indigo-600" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2 shadow-xl border-slate-100"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm bg-slate-50/50 rounded-lg mb-1">
                <Avatar className="h-10 w-10 rounded-lg border-2 border-white shadow-sm">
                  <AvatarImage src={userAvatarUrl} alt={userName} />
                  <AvatarFallback className="rounded-lg bg-indigo-600 text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-slate-800">
                    {userName}
                  </span>
                  <span className="text-slate-500 truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2 bg-slate-100" />

            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-indigo-50 focus:text-indigo-600 font-medium">
                <IconUserCircle className="mr-3 h-4 w-4 opacity-70" /> Account
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2 bg-slate-100" />

            <DropdownMenuItem
              onClick={onLogout}
              className="rounded-lg cursor-pointer py-2 focus:bg-red-50 focus:text-red-600 text-slate-600 font-medium"
            >
              <IconLogout className="mr-3 h-4 w-4 opacity-70" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

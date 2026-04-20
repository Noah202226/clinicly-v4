import { useAuthStore } from "@/app/store/useAuthStore";

type UseRoleReturn = {
  role: string;
  isOwner: boolean;
  isAdmin: boolean;
  isDentist: boolean;
};

export function useRole(): UseRoleReturn {
  const userDoc = useAuthStore((state: any) => state.userDoc);

  const role = userDoc?.role ?? "user";

  return {
    role,
    isOwner: role == "owner",
    isAdmin: role === "admin",
    isDentist: role === "dentist",
  };
}

"use client";

import { Button } from "@/components/ui/button";
import { account } from "@/app/appwrite"; // Siguraduhing tama ang import path
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PendingApproval() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- Logout Function ---
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await account.deleteSession("current"); // Burahin ang Appwrite session
      await checkAuth(); // I-sync ang Zustand store (magiging null ang user)
      toast.success("Logged out successfully");
      router.push("/login"); // Balik sa login page
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center p-6 bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-50 rounded-full">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin-slow" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Account Pending Approval
        </h1>

        <p className="text-muted-foreground mt-3 text-balance">
          Salamat sa pag-register! Ang iyong account ay kasalukuyang sinusuri ng
          aming administrator. Makakatanggap ka ng access kapag na-approve na
          ito.
        </p>

        <div className="flex flex-col gap-3 mt-8">
          {/* Refresh/Check Status Button */}
          <Button
            className="w-full h-11 font-semibold"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Status
          </Button>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full h-11 font-semibold border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout & Try Another Account
          </Button>
        </div>

        <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
          System Access Control
        </p>
      </div>
    </div>
  );
}

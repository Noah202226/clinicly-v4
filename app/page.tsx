"use client";

import { Loader2 } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";

export default function Home() {
  const { user } = useAuthStore();

  console.log(user);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-900">
          Verifying Permissions
        </p>
        <p className="text-sm text-slate-500">
          Please wait while we set up your workspace...
        </p>
      </div>
    </div>
  );
}

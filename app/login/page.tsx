"use client";

import { useEffect } from "react";

import { HouseWifi } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { toast } from "sonner";

export default function LoginPage() {
  useEffect(() => {
    // 🚀 FIX: Introduce a small delay to ensure the global <Toaster /> component is ready.
    const timer = setTimeout(() => {
      toast.info("Please log in to continue.");
    }, 100); // 100ms is usually enough

    // Cleanup function to clear the timeout if the component unmounts quickly
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <HouseWifi className="size-4" />
            </div>
            Egargue Dental Group.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/Egargue-logo1-Final.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-contain p-2 dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

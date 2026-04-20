"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore"; // 🚀 Use preferred path
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  // 🚀 Get the login function and checkAuth from the store
  const { handleLogin, checkAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handle Input Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError(null);
  };

  // --- Handle Form Submission (Appwrite Login) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    setLoading(true);

    try {
      // 🚀 APPWRITE SESSION CREATION
      // The handleLogin function should be implemented in your Zustand store
      // to call account.createEmailPasswordSession
      await handleLogin(formData.email, formData.password);

      // Fetch the logged-in user data and update the global store
      const user = await checkAuth();

      toast.success(`Welcome back, ${user?.name || "User"}!`);

      // Redirect to the dashboard
      router.replace("/dashboard");
    } catch (err: any) {
      // console.error("Appwrite Login Error:", err);
      // Display a user-friendly error message
      const errorMessage =
        err.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
      toast.error("Login Failed", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email and password to access your account.
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            defaultValue={"testuser@gmail.com"}
          />
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            defaultValue={"testpassword"}
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Field>

        <Field>
          <div className="flex justify-between text-sm">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </a>
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}

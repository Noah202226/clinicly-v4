"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { account, DATABASE_ID, databases } from "@/app/appwrite"; // 🚀 Import the Appwrite account service
import { useAuthStore } from "@/app/store/useAuthStore"; // 🚀 Import Zustand store
import { ID } from "appwrite";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { is, ro } from "date-fns/locale";
import { permission } from "process";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Handle Input Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError(null); // Clear error on new input
  };

  // --- 2. Handle Form Submission (Appwrite Signup) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Security Key Validation
    const ADMIN_SECRET = process.env.NEXT_PUBLIC_SIGNUP_SECURITY_KEY;

    if (formData.securityKey !== ADMIN_SECRET) {
      setError(
        "Invalid Security Key. You are not authorized to create an account.",
      );
      toast.error("Unauthorized", {
        description: "Invalid admin security key.",
      });
      return;
    }

    setLoading(true);

    try {
      // 🚀 APPWRITE ACCOUNT CREATION
      const response = await account.create(
        ID.unique(), // Unique User ID
        formData.email,
        formData.password,
        formData.name, // User Name
      );

      const userId = response.$id;
      console.log("New User ID:", userId);

      if (!userId) {
        throw new Error("User ID not returned after signup.");
      }

      const newUser = {
        accountId: userId,
        email: formData.email,
        name: formData.name,
        role: "pending",
        isActive: false,
        permissions: ["read", "write"],
      };

      console.log("New User Object:", newUser);

      try {
        // You can store additional user data in a database collection if needed
        // For example, using Appwrite's database service
        const res = await databases.createDocument(
          DATABASE_ID, // Replace with your database ID
          "users", // Replace with your users collection ID)
          ID.unique(),
          newUser,
        );

        console.log("Additional user data stored successfully.", res);
      } catch (dbError) {
        console.error("Error storing additional user data:", dbError);
      }

      // 3. Create Session for the newly registered user (Auto-login)
      const session = await account.createEmailPasswordSession(
        formData.email,
        formData.password,
      );

      // 4. Update global state and notify
      await checkAuth(); // Updates Zustand state with the new user data
      toast.success(
        `Welcome, ${response.name}! Your account has been created.`,
      );

      // 5. Redirect to the protected home page or dashboard
      router.push("/pending-approval"); // Redirect to a pending approval page or dashboard
    } catch (err: any) {
      console.error("Appwrite Signup Error:", err);
      // Display a user-friendly error message
      setError(err.message || "An unexpected error occurred during signup.");
      toast.error("Signup Failed", {
        description:
          err.message || "Please check your credentials or try again later.",
      });
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Full Name */}
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </Field>

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
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
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
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword" // <-- Changed from confirm-password for consistency
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </Field>

        {/* Security Key */}
        <Field>
          <FieldLabel htmlFor="securityKey">Admin Security Key</FieldLabel>
          <Input
            id="securityKey"
            type="password"
            placeholder="Enter secret key"
            required
            value={formData.securityKey}
            onChange={handleChange}
          />
          <FieldDescription>
            Only authorized personnel can create admin accounts.
          </FieldDescription>
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Account Proceed"
            )}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

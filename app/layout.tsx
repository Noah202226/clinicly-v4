import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import "@/app/globals.css";
// 1. Keep Server-Side Imports for Fonts and Metadata
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "./auth-provider"; // 🚀 Import the client wrapper

// 2. Remove all hook/client imports: Toaster, useAuthStore, useRouter, useEffect, Loader2

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat", // This links to your CSS
});

const APP_NAME = "Cliniqly - Dental Clinic Management System";
const APP_DEFAULT_TITLE = "Cliniqly";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best Dental clinic app in the world!";

// 3. Keep metadata export untouched (Server Component feature)
export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  // ... rest of metadata
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

// 4. Remove all hooks/client logic from the RootLayout function
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} transition-colors duration-300 antialiased`}
      >
        {/* 🚀 Wrap children with the client-side AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

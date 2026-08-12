import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { ToastProvider } from "@/components/common/Toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MealPrep Pro",
  description:
    "Calculate nutrition, plan meals, track calories, and optimise your grocery shopping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={plusJakarta.variable}
    >
      <body className="font-sans antialiased text-foreground bg-background">
        <ThemeApplier />
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}

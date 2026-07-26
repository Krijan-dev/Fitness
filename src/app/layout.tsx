import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import "./globals.css";

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
    <html lang="en" data-theme="dark">
      <body>
        <ThemeApplier />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PlannerProvider } from "@/src/context/PlannerContext";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SkillMap",
  description: "Local-first learning planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", spaceGrotesk.variable, spaceMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <PlannerProvider>
          {children}
        </PlannerProvider>
        <Analytics />
      </body>
    </html>
  );
}

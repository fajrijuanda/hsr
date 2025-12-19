import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HSR Tools Hub | Honkai: Star Rail Companion",
  description: "Your all-in-one Honkai: Star Rail toolkit. Track banners, redeem codes, optimize team speed, simulate battles, and more.",
  keywords: ["Honkai Star Rail", "HSR", "Speed Tuner", "Banner Countdown", "Redeem Codes", "MoC", "Pull Planner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}


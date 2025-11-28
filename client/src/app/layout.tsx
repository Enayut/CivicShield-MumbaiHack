import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicShield AI - Admin Dashboard",
  description: "Comprehensive misinformation detection and monitoring platform for election integrity",
  keywords: ["AI", "misinformation", "election", "monitoring", "civic", "democracy"],
  authors: [{ name: "CivicShield AI Team" }],
  creator: "CivicShield AI",
  publisher: "CivicShield AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-background-50 to-background-100 dark:from-background-900 dark:to-background-800`}
      >
        <ThemeProvider
          defaultTheme="dark"
          storageKey="civicshield-ui-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

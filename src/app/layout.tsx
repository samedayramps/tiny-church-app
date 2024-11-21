import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutClient } from "./layout-client";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Church - Simple Church Management",
  description: "The straightforward admin platform built specifically for small churches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full bg-background antialiased`}>
        <LayoutClient>
          {children}
        </LayoutClient>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

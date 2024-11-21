"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { LandingNavbar } from "@/components/layout/landing-navbar";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="relative flex min-h-screen flex-col">
      {isHomePage ? <LandingNavbar /> : <Navbar />}
      <main className={`flex-1 ${isHomePage ? "pt-16" : ""}`}>
        {!isHomePage && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        )}
        {isHomePage && children}
      </main>
    </div>
  );
} 
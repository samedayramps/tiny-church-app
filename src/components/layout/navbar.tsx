"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  LayoutDashboard,
  Mail,
  ChevronDown,
  Menu,
} from "lucide-react";
import { UserProfileMenu } from "@/components/nav/user-profile-menu";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Members",
    icon: Users,
    href: "/members",
    color: "text-violet-500",
  },
  {
    label: "Groups",
    icon: Users,
    href: "/groups",
    color: "text-emerald-500",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/events",
    color: "text-pink-700",
  },
  {
    label: "Messaging",
    icon: Mail,
    href: "/messaging",
    color: "text-orange-500",
  }
];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-x-4">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-x-2 text-muted-foreground transition-colors hover:text-primary",
                      pathname === route.href && "text-foreground font-medium"
                    )}
                  >
                    <route.icon className={cn("h-5 w-5", route.color)} />
                    <span>{route.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo and Desktop Navigation */}
          <Link 
            href="/" 
            className="hidden md:flex items-center gap-x-2 font-semibold"
          >
            <span className="hidden lg:inline-block">Church Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-x-4 lg:gap-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                  pathname === route.href && "text-foreground"
                )}
              >
                <route.icon className={cn("h-4 w-4", route.color)} />
                <span className="hidden lg:inline-block">{route.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo (centered) */}
        <div className="flex md:hidden flex-1 justify-center">
          <Link href="/" className="font-semibold">
            Church Admin
          </Link>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <UserProfileMenu user={user} />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login" className="gap-x-2">
                <span>Sign in</span>
                <ChevronDown className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden border-t">
        <nav className="container mx-auto px-4 flex justify-between py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground transition-colors hover:text-primary",
                pathname === route.href && "text-foreground"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
} 
'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  CalendarDays, 
  UsersRound, 
  Mail, 
  Clock, 
  Database 
} from "lucide-react";

const settingsNav = [
  {
    title: "General",
    href: "/settings/general",
    icon: Settings
  },
  {
    title: "Members",
    href: "/settings/members",
    icon: Users
  },
  {
    title: "Events",
    href: "/settings/events",
    icon: CalendarDays
  },
  {
    title: "Groups",
    href: "/settings/groups",
    icon: UsersRound
  },
  {
    title: "Communication",
    href: "/settings/communication",
    icon: Mail
  },
  {
    title: "Service Times",
    href: "/settings/services",
    icon: Clock
  },
  {
    title: "Custom Fields",
    href: "/settings/custom-fields",
    icon: Database
  }
];

interface SettingsLayoutClientProps {
  children: React.ReactNode;
}

export function SettingsLayoutClient({ children }: SettingsLayoutClientProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <div className="w-64 border-r flex flex-col bg-muted/30">
        <div className="p-4 border-b bg-background">
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization preferences
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 mb-1",
                  pathname === item.href && "bg-muted"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
} 
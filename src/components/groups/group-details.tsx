"use client";

import { type Database } from '@/types/supabase';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  Users,
  Info,
  Calendar,
  User2,
  StickyNote,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type Group = Database['public']['Tables']['groups']['Row'] & {
  member_count?: number;
  leader_id?: string | null;
};

interface GroupDetailsProps {
  group: Group;
  className?: string;
  mode?: 'card' | 'dialog';
}

// Extract DetailItem into a reusable component
function DetailItem({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-colors group",
      "hover:bg-muted/50",
      className
    )}>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground/70" />
      <div className="space-y-1 min-w-0 flex-1">
        <p className="text-sm font-medium leading-none text-muted-foreground group-hover:text-foreground/70">
          {label}
        </p>
        <p className="text-sm break-words">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );
}

// Group Icon component
function GroupIcon({ 
  size = "lg" 
}: { 
  size?: "sm" | "lg";
}) {
  const dimensions = size === "lg" ? "h-24 w-24" : "h-8 w-8";
  const iconSize = size === "lg" ? "h-12 w-12" : "h-4 w-4";

  return (
    <div className={cn(dimensions, "rounded-lg bg-primary/10 flex items-center justify-center")}>
      <Users className={cn(iconSize, "text-primary")} />
    </div>
  );
}

export function GroupDetails({ group, className, mode = 'card' }: GroupDetailsProps) {
  return (
    <Card className={cn(
      "overflow-hidden",
      mode === 'dialog' && "border-0 shadow-none",
      className
    )}>
      <CardContent className="p-0">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-4">
            <GroupIcon size="sm" />
            <div className="space-y-1.5">
              <h3 className="text-lg font-medium">
                {group.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {group.group_type || 'General'}
                </Badge>
                <Badge variant="outline">
                  {group.member_count || 0} members
                </Badge>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Group Information */}
            <Section title="Group Information">
              <div className="divide-y">
                <DetailItem 
                  icon={Info} 
                  label="Type" 
                  value={group.group_type ? 
                    group.group_type.charAt(0).toUpperCase() + group.group_type.slice(1) 
                    : 'General'
                  } 
                />
                <DetailItem 
                  icon={Calendar} 
                  label="Created" 
                  value={group.created_at ? new Date(group.created_at).toLocaleDateString() : undefined} 
                />
                {group.description && (
                  <DetailItem
                    icon={StickyNote}
                    label="Description"
                    value={group.description}
                  />
                )}
              </div>
            </Section>

            {/* Leadership */}
            {(group as Group).leader_id && (
              <Section title="Leadership">
                <div className="divide-y">
                  <DetailItem
                    icon={User2}
                    label="Group Leader"
                    value="Leader name will go here"
                  />
                </div>
              </Section>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Section component
function Section({ 
  title, 
  children,
  defaultOpen = true
}: { 
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="space-y-1 animate-in fade-in-50 duration-500"
    >
      <div className="flex items-center justify-between px-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          {title}
        </h4>
        <CollapsibleTrigger className="hover:bg-muted/50 p-1 rounded-md">
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="bg-card/50 rounded-lg">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 
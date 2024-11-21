"use client";

import { type Database } from '@/types/supabase';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  Calendar, 
  User2, 
  StickyNote,
  Image as ImageIcon,
  Building2,
  Briefcase,
  ChevronDown,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Member = Database['public']['Tables']['members']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

interface MemberDetailsProps {
  member: Member;
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

// Extract MemberAvatar into a reusable component
function MemberAvatar({ 
  photoUrl, 
  name, 
  size = "lg" 
}: { 
  photoUrl?: string | null;
  name: string;
  size?: "sm" | "lg";
}) {
  const dimensions = size === "lg" ? "h-24 w-24" : "h-8 w-8";
  const iconSize = size === "lg" ? "h-12 w-12" : "h-4 w-4";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn(dimensions, "rounded-full object-cover")}
      />
    );
  }

  return (
    <div className={cn(dimensions, "rounded-full bg-muted flex items-center justify-center")}>
      <User2 className={cn(iconSize, "text-muted-foreground")} />
    </div>
  );
}

function GroupItem({ 
  group,
  onClick
}: { 
  group: Group;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg transition-colors group hover:bg-muted/50">
      <div className="flex items-start gap-3">
        <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground/70" />
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium leading-none group-hover:text-foreground/70">
            {group.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {group.group_type}
          </p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClick}
      >
        View
      </Button>
    </div>
  );
}

export function MemberDetails({ member, className, mode = 'card' }: MemberDetailsProps) {
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMemberGroups() {
      try {
        const response = await fetch(`/api/members/${member.id}/groups`);
        if (!response.ok) throw new Error('Failed to fetch member groups');
        const data = await response.json();
        setMemberGroups(data);
      } catch (error) {
        console.error('Error fetching member groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    }

    fetchMemberGroups();
  }, [member.id]);

  const customFields = member.custom_fields as { 
    ministry?: string;
    baptized?: boolean;
    leadership?: boolean;
    instruments?: string[];
    skills?: string[];
  } | null;

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
            <MemberAvatar 
              photoUrl={member.photo_url} 
              name={`${member.first_name} ${member.last_name}`}
              size="sm"
            />
            <div className="space-y-1.5">
              <h3 className="text-lg font-medium">
                {member.first_name} {member.last_name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                >
                  {member.status}
                </Badge>
                {customFields?.leadership && (
                  <Badge variant="outline">
                    Leadership
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Section title="Contact Information">
              <div className="divide-y">
                <DetailItem icon={Mail} label="Email" value={member.email} />
                <DetailItem icon={Phone} label="Phone" value={member.phone} />
                <DetailItem 
                  icon={Calendar} 
                  label="Member Since" 
                  value={member.date_added ? new Date(member.date_added).toLocaleDateString() : undefined} 
                />
                {member.address && typeof member.address === 'object' && 'street' in member.address && (
                  <DetailItem
                    icon={Building2}
                    label="Address"
                    value={(member.address as { street?: string }).street}
                  />
                )}
              </div>
            </Section>

            {/* Ministry Information */}
            {customFields && (
              <Section title="Ministry Information">
                <div className="divide-y">
                  {customFields.ministry && (
                    <DetailItem
                      icon={Briefcase}
                      label="Ministry"
                      value={customFields.ministry.replace('_', ' ')}
                    />
                  )}
                  {customFields.instruments && (
                    <DetailItem
                      icon={StickyNote}
                      label="Instruments"
                      value={customFields.instruments.join(', ')}
                    />
                  )}
                  {customFields.skills && (
                    <DetailItem
                      icon={StickyNote}
                      label="Skills"
                      value={customFields.skills.join(', ')}
                    />
                  )}
                </div>
              </Section>
            )}

            {/* Notes */}
            {member.notes && (
              <Section title="Notes">
                <div className="divide-y">
                  <DetailItem icon={StickyNote} label="Notes" value={member.notes} />
                </div>
              </Section>
            )}

            {/* Add Groups Section */}
            <Section title="Groups">
              <div className="divide-y">
                {isLoadingGroups ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Loading groups...
                  </div>
                ) : memberGroups.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Not a member of any groups
                  </div>
                ) : (
                  memberGroups.map((group) => (
                    <GroupItem
                      key={group.id}
                      group={group}
                      onClick={() => router.push(`/groups/${group.id}`)}
                    />
                  ))
                )}
              </div>
            </Section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Update Section component
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
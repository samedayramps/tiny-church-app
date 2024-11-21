"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MemberDetails } from "@/components/members/member-details";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];

interface GroupMembersTabsProps {
  groupMembers: Member[];
  availableMembers: Member[];
  onAddMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

function MemberCard({ 
  member, 
  action,
  onMemberClick,
}: { 
  member: Member; 
  action: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive";
  };
  onMemberClick: (member: Member) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:opacity-80"
                onClick={() => onMemberClick(member)}
              >
                <Avatar>
                  <AvatarImage src={member.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {member.first_name?.[0]}
                    {member.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {member.first_name?.[0]}
                    {member.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    {member.first_name} {member.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex items-center pt-2">
                    <Badge variant="secondary" className="mr-1">
                      {member.status || 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GroupMembersTabs({
  groupMembers,
  availableMembers,
  onAddMember,
  onRemoveMember,
}: GroupMembersTabsProps) {
  const [activeTab, setActiveTab] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter members based on search query
  const filteredGroupMembers = groupMembers.filter(member =>
    debouncedSearch
      ? member.first_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
  );

  const filteredAvailableMembers = availableMembers.filter(member =>
    debouncedSearch
      ? member.first_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
  );

  return (
    <>
      <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="current">
                Current Members ({groupMembers.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available Members ({availableMembers.length})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === "current" ? "current" : "available"} members...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <TabsContent value="current" className="space-y-4 mt-4">
          {filteredGroupMembers.length === 0 ? (
            <Card>
              <CardContent className="flex h-[120px] items-center justify-center text-muted-foreground">
                {debouncedSearch ? "No members found" : "No members in this group"}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGroupMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onMemberClick={setSelectedMember}
                  action={{
                    label: "Remove",
                    icon: UserMinus,
                    onClick: () => onRemoveMember(member.id),
                    variant: "destructive"
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4 mt-4">
          {filteredAvailableMembers.length === 0 ? (
            <Card>
              <CardContent className="flex h-[120px] items-center justify-center text-muted-foreground">
                {debouncedSearch ? "No members found" : "No available members to add"}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAvailableMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onMemberClick={setSelectedMember}
                  action={{
                    label: "Add",
                    icon: UserPlus,
                    onClick: () => onAddMember(member.id)
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMember && (
            <MemberDetails 
              member={selectedMember} 
              mode="dialog"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 
'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GroupDetails } from '@/components/groups/group-details';
import { GroupMembersManager } from '@/components/groups/group-members-manager';
import { Mail } from "lucide-react";
import { useEffect, useState } from 'react';
import type { Database } from '@/types/supabase';
import { GroupHeaderSkeleton, GroupDetailsSkeleton } from '@/components/groups/loading-states';

type Group = Database['public']['Tables']['groups']['Row'] & {
  member_count?: number;
};

interface GroupContentProps {
  groupId: string;
}

export function GroupContent({ groupId }: GroupContentProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGroup() {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/groups/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group');
        const data = await response.json();
        setGroup(data);
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroup();
  }, [groupId]);

  if (isLoading) {
    return (
      <>
        <GroupHeaderSkeleton />
        <GroupDetailsSkeleton />
      </>
    );
  }

  if (!groupId || !group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">No group selected</h2>
          <p className="text-sm text-muted-foreground">
            Select a group from the sidebar to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">
              {group.member_count || 0} members
            </p>
          </div>
          <div>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email Group
            </Button>
          </div>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="px-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="p-4">
            <GroupMembersManager groupId={groupId} />
          </TabsContent>

          <TabsContent value="details" className="p-4">
            <GroupDetails group={group} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 
'use client';

import { useState } from 'react';
import { GroupListSkeleton } from '@/components/groups/group-list-skeleton';
import { ClientGroupList } from '@/components/groups/client-group-list';
import { Search } from '@/components/groups/search';
import { NewGroupDialog } from "@/components/groups/new-group-dialog";
import type { Database } from '@/types/supabase';
import { Suspense } from 'react';

type GroupWithCount = Database['public']['Tables']['groups']['Row'] & {
  member_count: number;
};

interface GroupsLayoutClientProps {
  children: React.ReactNode;
  initialGroups: GroupWithCount[];
}

export function GroupsLayoutClient({ children, initialGroups }: GroupsLayoutClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGroupCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <div className="w-80 border-r flex flex-col bg-muted/30">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Groups</h1>
            <NewGroupDialog onGroupCreated={handleGroupCreated} />
          </div>
          <Search placeholder="Search groups..." className="w-full" />
        </div>
        <Suspense fallback={<GroupListSkeleton />}>
          <ClientGroupList 
            initialGroups={initialGroups} 
            refreshTrigger={refreshTrigger}
          />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
} 
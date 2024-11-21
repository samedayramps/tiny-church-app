'use client';

import { useState, useEffect } from 'react';
import { GroupList } from '@/components/groups/group-list';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

type Group = Database['public']['Tables']['groups']['Row'] & {
  member_count?: number;
};

interface ClientGroupListProps {
  initialGroups: Group[];
  refreshTrigger?: number;
}

export function ClientGroupList({ initialGroups, refreshTrigger = 0 }: ClientGroupListProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const selectedGroupId = params?.groupId as string;

  // Calculate total pages
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);

  // Fetch groups when search query changes or refreshTrigger changes
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const query = searchParams.get('query');
        const response = await fetch(`/api/groups${query ? `?query=${query}` : ''}`);
        
        if (!response.ok) throw new Error('Failed to fetch groups');
        
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch groups',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [searchParams, toast, refreshTrigger]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectGroup = (group: Group) => {
    router.push(`/groups/${group.id}`);
  };

  return (
    <GroupList
      groups={groups}
      selectedGroupId={selectedGroupId}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onSelectGroup={handleSelectGroup}
      onUpdateGroup={async (id, updates) => {
        // ... existing update logic ...
      }}
      onDeleteGroup={async (id) => {
        // ... existing delete logic ...
      }}
    />
  );
} 
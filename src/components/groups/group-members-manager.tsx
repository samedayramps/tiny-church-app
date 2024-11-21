"use client";

import { useEffect, useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { GroupMembersTabs } from "./group-members-tabs";
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];
type MemberGroup = Database['public']['Tables']['member_groups']['Row'] & {
  members: Member;
};

interface GroupMembersManagerProps {
  groupId: string;
  searchQuery?: string;
  onMemberCountChange?: (count: number) => void;
}

export function GroupMembersManager({ 
  groupId, 
  searchQuery = '',
  onMemberCountChange 
}: GroupMembersManagerProps) {
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMemberCountChange = useCallback((count: number) => {
    onMemberCountChange?.(count);
  }, [onMemberCountChange]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMembers() {
      try {
        setError(null);
        setLoading(true);
        
        const query = searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : '';
        const response = await fetch(`/api/groups/${groupId}/members${query}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch members');
        }
        
        const data = await response.json();
        if (!isMounted) return;

        setGroupMembers(data.groupMembers);
        setAvailableMembers(data.availableMembers);
        handleMemberCountChange(data.groupMembers.length);
      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch members';
        console.error('Error in GroupMembersManager:', errorMessage);
        setError(errorMessage);
        toast({
          title: "Error loading members",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMembers();
    return () => {
      isMounted = false;
    };
  }, [groupId, searchQuery, handleMemberCountChange, toast]);

  const handleAddMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error('Failed to add member');

      const member = availableMembers.find(m => m.id === memberId);
      if (member) {
        const newGroupMembers = [...groupMembers, member];
        setGroupMembers(newGroupMembers);
        setAvailableMembers(prev => prev.filter(m => m.id !== memberId));
        handleMemberCountChange(newGroupMembers.length);
      }

      toast({
        title: "Member added",
        description: "Member has been added to the group.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add member to group.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error('Failed to remove member');

      const member = groupMembers.find(m => m.id === memberId);
      if (member) {
        const newGroupMembers = groupMembers.filter(m => m.id !== memberId);
        setAvailableMembers(prev => [...prev, member]);
        setGroupMembers(newGroupMembers);
        handleMemberCountChange(newGroupMembers.length);
      }

      toast({
        title: "Member removed",
        description: "Member has been removed from the group.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove member from group.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <GroupMembersTabs
      groupMembers={groupMembers}
      availableMembers={availableMembers}
      onAddMember={handleAddMember}
      onRemoveMember={handleRemoveMember}
    />
  );
} 
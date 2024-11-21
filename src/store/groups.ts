import { create } from 'zustand';
import type { Database } from '@/types/supabase';

type Group = Database['public']['Tables']['groups']['Row'] & {
  member_count?: number;
};

interface GroupState {
  groups: Group[];
  selectedGroupId: string | null;
  isLoading: boolean;
  error: Error | null;
  setGroups: (groups: Group[]) => void;
  selectGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  selectedGroupId: null,
  isLoading: false,
  error: null,
  setGroups: (groups) => set({ groups }),
  selectGroup: (id) => set({ selectedGroupId: id }),
  updateGroup: async (id, updates) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update group');
      
      set(state => ({
        groups: state.groups.map(group => 
          group.id === id ? { ...group, ...updates } : group
        )
      }));
    } catch (error) {
      set({ error: error as Error });
      throw error;
    }
  },
  deleteGroup: async (id) => {
    // Similar implementation for delete
  }
})); 
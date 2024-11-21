import type { Database } from './supabase';

export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupWithCount = Group & { member_count: number };

export interface GroupActions {
  onUpdateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onSelectGroup: (group: GroupWithCount) => void;
}

export type GroupListProps = {
  groups: GroupWithCount[];
  selectedGroupId?: string;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
} & GroupActions; 
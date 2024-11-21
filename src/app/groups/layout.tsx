import { Suspense } from 'react';
import { GroupListSkeleton } from '@/components/groups/group-list-skeleton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { GroupsLayoutClient } from './groups-layout-client';

type GroupWithCount = Database['public']['Tables']['groups']['Row'] & {
  member_count: number;
};

export default async function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
  
  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      *,
      member_count:member_groups(count)
    `);

  if (error) {
    console.error('Error fetching groups:', error);
    return null;
  }

  const groupsWithCounts: GroupWithCount[] = (groups || []).map(group => ({
    ...group as Database['public']['Tables']['groups']['Row'],
    member_count: Number((group as any).member_count?.[0]?.count || 0)
  }));

  return (
    <Suspense fallback={<GroupListSkeleton />}>
      <GroupsLayoutClient initialGroups={groupsWithCounts}>
        {children}
      </GroupsLayoutClient>
    </Suspense>
  );
} 
import { Suspense } from 'react';
import { GroupContent } from '@/components/groups/group-content';
import { GroupHeaderSkeleton, GroupDetailsSkeleton } from '@/components/groups/loading-states';

interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  
  if (!groupId) {
    return null;
  }

  return (
    <Suspense fallback={
      <>
        <GroupHeaderSkeleton />
        <GroupDetailsSkeleton />
      </>
    }>
      <GroupContent groupId={groupId} />
    </Suspense>
  );
} 
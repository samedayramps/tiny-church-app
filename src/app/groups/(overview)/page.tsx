import { Suspense } from 'react';
import { GroupContent } from '@/components/groups/group-content';
import { GroupHeaderSkeleton, GroupDetailsSkeleton } from '@/components/groups/loading-states';

export default function GroupsPage() {
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
export function GroupHeaderSkeleton() {
  return (
    <div className="px-4 py-4 border-b animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
    </div>
  );
}

export function GroupDetailsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-24 bg-muted rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
} 
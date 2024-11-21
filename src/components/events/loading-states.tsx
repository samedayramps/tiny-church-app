export function EventDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 bg-muted rounded"></div>
      <div className="space-y-3">
        <div className="h-4 w-1/4 bg-muted rounded"></div>
        <div className="h-4 w-1/2 bg-muted rounded"></div>
        <div className="h-4 w-3/4 bg-muted rounded"></div>
      </div>
      <div className="flex gap-2 mt-6">
        <div className="h-9 w-24 bg-muted rounded"></div>
        <div className="h-9 w-24 bg-muted rounded"></div>
      </div>
    </div>
  );
} 
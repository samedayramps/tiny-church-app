export function EventListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 animate-pulse"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="flex items-center gap-4">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-3 w-12 bg-muted rounded" />
            </div>
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
} 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GroupListSkeleton() {
  return (
    <div className="flex-1 overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden sm:table-cell">Members</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-[180px] bg-muted animate-pulse rounded" />
                    <div className="h-3 w-[120px] bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
"use client";

import { useRef, useState } from 'react';
import type { Database } from '@/types/supabase';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRouter } from "next/navigation";
import Link from "next/link";

type Group = Database['public']['Tables']['groups']['Row'] & {
  member_count?: number;
};

interface GroupListProps {
  groups: Group[];
  onUpdateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onSelectGroup: (group: Group) => void;
  selectedGroupId?: string;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Group row component - Extract to its own component for better organization
function GroupRow({ 
  group, 
  isSelected, 
  onSelect,
  onUpdate,
  onDelete 
}: { 
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Group>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isSelected && "bg-muted/75"
      )}
      onClick={onSelect}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{group.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {group.description || 'No description'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="secondary">
          {group.group_type || 'General'}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="text-sm text-muted-foreground">
          {group.member_count || 0} members
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ name: group.name });
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Loading skeleton component
function GroupRowSkeleton() {
  return (
    <TableRow className="animate-in fade-in-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2 flex-1 min-w-0">
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
  );
}

// Empty state component
function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No groups found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              No groups match your search criteria. Try adjusting your search or create a new group.
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function GroupList({ 
  groups, 
  onUpdateGroup, 
  onDeleteGroup,
  onSelectGroup,
  selectedGroupId,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
}: GroupListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Add error boundary
  const [error, setError] = useState<Error | null>(null);

  // Handle errors gracefully
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-red-500">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Something went wrong loading the groups.</p>
          <Button 
            variant="ghost" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Members</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-[70px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <GroupRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div 
      ref={parentRef}
      className="flex-1 overflow-auto border rounded-md"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden sm:table-cell">Members</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <EmptyState />
          ) : (
            groups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                isSelected={group.id === selectedGroupId}
                onSelect={() => onSelectGroup(group)}
                onUpdate={(updates) => {
                  try {
                    return onUpdateGroup(group.id, updates);
                  } catch (err) {
                    setError(err as Error);
                    throw err;
                  }
                }}
                onDelete={async () => {
                  try {
                    await onDeleteGroup(group.id);
                  } catch (err) {
                    setError(err as Error);
                    throw err;
                  }
                }}
              />
            ))
          )}
        </TableBody>
      </Table>

      {groups.length > 0 && (
        <div className="sticky bottom-0 border-t bg-background p-2 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
} 
"use client";

import { useRef } from 'react';
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
import { MoreHorizontal, User2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { useVirtualizer } from '@tanstack/react-virtual';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberListProps {
  members: Member[];
  onUpdateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onSelectMember: (member: Member) => void;
  selectedMemberId?: string;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  actionLabel?: string;
  actionIcon?: React.ElementType;
}

// Extract MemberRow into a separate component for better organization
function MemberRow({ 
  member, 
  isSelected, 
  onSelect,
  onUpdate,
  onDelete 
}: { 
  member: Member;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Member>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
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
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt=""
              className="h-8 w-8 rounded-full object-cover bg-muted"
              loading="lazy"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User2 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">
              {member.first_name} {member.last_name}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {member.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="text-sm space-y-1">
          <div className="truncate">{member.email}</div>
          <div className="text-muted-foreground truncate">
            {member.phone || 'No phone'}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
          {member.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {member.date_added ? new Date(member.date_added).toLocaleDateString() : 'N/A'}
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
                onUpdate({
                  status: member.status === 'active' ? 'inactive' : 'active'
                });
              }}
            >
              {member.status === 'active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Extract MemberRowSkeleton for loading states
function MemberRowSkeleton() {
  return (
    <TableRow className="animate-in fade-in-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-[180px] bg-muted animate-pulse rounded" />
            <div className="h-3 w-[120px] bg-muted animate-pulse rounded" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

// Add EmptyState component
function EmptyState() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No members found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          No members match your search criteria. Try adjusting your search.
        </p>
      </div>
    </div>
  )
}

export function MemberList({ 
  members, 
  onUpdateMember, 
  onDeleteMember,
  onSelectMember,
  selectedMemberId,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  actionLabel,
  actionIcon,
}: MemberListProps) {
  // Change React.useRef to useRef
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 10 : members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Approximate row height
    overscan: 5
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="bg-background h-10">Member</TableHead>
              <TableHead className="hidden md:table-cell bg-background h-10">Contact</TableHead>
              <TableHead className="hidden sm:table-cell bg-background h-10">Status</TableHead>
              <TableHead className="hidden md:table-cell bg-background h-10">Added</TableHead>
              <TableHead className="w-[70px] bg-background h-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <MemberRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-md border">
      <div 
        ref={parentRef}
        className="min-h-0 flex-1 overflow-auto"
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead className="bg-background h-10">Member</TableHead>
              <TableHead className="hidden md:table-cell bg-background h-10">Contact</TableHead>
              <TableHead className="hidden sm:table-cell bg-background h-10">Status</TableHead>
              <TableHead className="hidden md:table-cell bg-background h-10">Added</TableHead>
              <TableHead className="w-[70px] bg-background h-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <EmptyState />
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <MemberRow
                  key={members[virtualRow.index].id}
                  member={members[virtualRow.index]}
                  isSelected={members[virtualRow.index].id === selectedMemberId}
                  onSelect={() => onSelectMember(members[virtualRow.index])}
                  onUpdate={(updates) => onUpdateMember(members[virtualRow.index].id, updates)}
                  onDelete={() => onDeleteMember(members[virtualRow.index].id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {members.length > 0 && (
        <div className="shrink-0 border-t bg-background p-2 flex justify-center">
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
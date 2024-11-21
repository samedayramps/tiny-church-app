"use client";

import { useRef } from 'react';
import type { Database } from '@/types/supabase';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";

type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  recurring: boolean;
  recurring_pattern: any | null;
  created_at: string;
  created_by: string;
  attendee_count?: number;
};

interface EventListProps {
  events: Event[];
  onUpdateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onSelectEvent: (event: Event) => void;
  selectedEventId?: string;
  isLoading?: boolean;
}

export function EventList({
  events,
  onUpdateEvent,
  onDeleteEvent,
  onSelectEvent,
  selectedEventId,
  isLoading
}: EventListProps) {
  if (isLoading) {
    return <div className="p-4">Loading events...</div>;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer",
              selectedEventId === event.id && "bg-muted"
            )}
            onClick={() => onSelectEvent(event)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{event.title}</h3>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(`2000-01-01T${event.time}`), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{event.attendee_count || 0}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add edit functionality
                  }}
                >
                  Edit event
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event.id);
                  }}
                >
                  Delete event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 
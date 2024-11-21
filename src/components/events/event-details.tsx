"use client";

import { type Database } from '@/types/supabase';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarRange,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

type Event = Database['public']['Tables']['events']['Row'] & {
  attendee_count?: number;
};

interface EventDetailsProps {
  event: Event;
  className?: string;
  mode?: 'card' | 'dialog';
}

function DetailItem({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-colors group",
      "hover:bg-muted/50",
      className
    )}>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground/70" />
      <div className="space-y-1 min-w-0 flex-1">
        <p className="text-sm font-medium leading-none text-muted-foreground group-hover:text-foreground/70">
          {label}
        </p>
        <p className="text-sm break-words">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );
}

export function EventDetails({ event, className, mode = 'card' }: EventDetailsProps) {
  const Container = mode === 'card' ? Card : 'div';
  
  return (
    <Container className={cn("h-full flex flex-col", className)}>
      <CardContent className={cn(
        "flex-1 space-y-2",
        mode === 'card' ? "p-6" : "p-0"
      )}>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{event.title}</h2>
          {event.recurring && (
            <Badge variant="secondary" className="mt-2">
              Recurring Event
            </Badge>
          )}
        </div>

        <div className="space-y-1 mt-6">
          <DetailItem
            icon={Calendar}
            label="Date"
            value={format(new Date(event.date), 'MMMM d, yyyy')}
          />
          <DetailItem
            icon={Clock}
            label="Time"
            value={format(new Date(`2000-01-01T${event.time}`), 'h:mm a')}
          />
          <DetailItem
            icon={MapPin}
            label="Location"
            value={event.location}
          />
          <DetailItem
            icon={Users}
            label="Attendees"
            value={`${event.attendee_count || 0} registered`}
          />
          {event.recurring && event.recurring_pattern && (
            <DetailItem
              icon={CalendarRange}
              label="Recurrence"
              value={JSON.stringify(event.recurring_pattern)}
            />
          )}
          <DetailItem
            icon={StickyNote}
            label="Description"
            value={event.description}
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button className="flex-1" variant="outline">
            Edit Event
          </Button>
          <Button className="flex-1" variant="default">
            Manage Attendees
          </Button>
        </div>
      </CardContent>
    </Container>
  );
} 
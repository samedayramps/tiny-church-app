'use client';

import { useState } from 'react';
import { EventListSkeleton } from '@/components/events/event-list-skeleton';
import { ClientEventList } from '@/components/events/client-event-list';
import { Search } from '@/components/events/search';
import { NewEventDialog } from "@/components/events/new-event-dialog";
import type { Database } from '@/types/supabase';
import { Suspense } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EventWithAttendees = Database['public']['Tables']['events']['Row'] & {
  attendee_count: number;
};

interface EventsLayoutClientProps {
  children: React.ReactNode;
  initialEvents: EventWithAttendees[];
}

export function EventsLayoutClient({ children, initialEvents }: EventsLayoutClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <div className="w-80 border-r flex flex-col bg-muted/30">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Events</h1>
            <NewEventDialog onEventCreated={handleEventCreated} />
          </div>
          <Search placeholder="Search events..." className="w-full mb-4" />
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger 
                value="upcoming" 
                className="flex-1"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="flex-1"
                onClick={() => setFilter('past')}
              >
                Past
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="flex-1"
                onClick={() => setFilter('all')}
              >
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Suspense fallback={<EventListSkeleton />}>
          <ClientEventList 
            initialEvents={initialEvents} 
            refreshTrigger={refreshTrigger}
            filter={filter}
          />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
} 
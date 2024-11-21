"use client";

import { useEffect, useState } from 'react';
import { EventList } from './event-list';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import type { Database } from '@/types/supabase';

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

interface ClientEventListProps {
  initialEvents: Event[];
  refreshTrigger: number;
  filter: 'upcoming' | 'past' | 'all';
}

export function ClientEventList({ 
  initialEvents,
  refreshTrigger,
  filter
}: ClientEventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/events?filter=${filter}`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to fetch events",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filter, refreshTrigger, toast]);

  const handleUpdateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update event');

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      router.refresh();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEventId(event.id);
    router.push(`/events/${event.id}`);
  };

  return (
    <EventList
      events={events}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
      onSelectEvent={handleSelectEvent}
      selectedEventId={selectedEventId}
      isLoading={isLoading}
    />
  );
} 
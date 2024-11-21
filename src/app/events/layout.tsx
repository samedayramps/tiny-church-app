import { Suspense } from 'react';
import { EventListSkeleton } from '@/components/events/event-list-skeleton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { EventsLayoutClient } from './events-layout-client';

type EventWithAttendees = Database['public']['Tables']['events']['Row'] & {
  attendee_count: number;
};

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wait for cookies to be available
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
  
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      attendee_count:event_attendees(count)
    `)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return null;
  }

  const eventsWithCounts: EventWithAttendees[] = (events || []).map(event => ({
    ...(event as unknown as Database['public']['Tables']['events']['Row']),
    attendee_count: Number((event as any).attendee_count?.[0]?.count || 0)
  }));

  return (
    <Suspense fallback={<EventListSkeleton />}>
      <EventsLayoutClient initialEvents={eventsWithCounts}>
        {children}
      </EventsLayoutClient>
    </Suspense>
  );
} 
import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Database } from '@/types/supabase';
import { EventDetails } from '@/components/events/event-details';

type Event = Database['public']['Tables']['events']['Row'] & {
  attendee_count?: number;
};

export default async function EventPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      attendee_count:event_attendees(count)
    `)
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  const eventWithCount = {
    ...(event as unknown as Database['public']['Tables']['events']['Row']),
    attendee_count: Number((event as any).attendee_count?.[0]?.count || 0)
  } satisfies Event;

  return (
    <div className="flex-1 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <EventDetails event={eventWithCount} />
      </Suspense>
    </div>
  );
} 
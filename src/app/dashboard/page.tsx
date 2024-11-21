import { Suspense } from 'react';
import { DashboardClient } from './dashboard-client';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export default async function DashboardPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });

    // Fetch upcoming events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        date,
        time,
        location,
        recurring,
        recurring_pattern,
        created_at,
        attendee_count:event_attendees(count)
      `)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(5);

    if (eventsError) throw eventsError;

    // Fetch member statistics with a single query
    const { data: memberStats, error: statsError } = await supabase
      .from('members')
      .select('status')
      .in('status', ['active', 'inactive']);

    if (statsError) throw statsError;

    // Calculate member statistics
    const stats = {
      active: memberStats?.filter(m => m.status === 'active').length || 0,
      inactive: memberStats?.filter(m => m.status === 'inactive').length || 0,
      total: memberStats?.length || 0
    };

    // Transform event data
    const upcomingEvents = events?.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      recurring: event.recurring,
      recurring_pattern: event.recurring_pattern,
      created_at: event.created_at,
      attendee_count: Number((event.attendee_count as any)?.[0]?.count || 0)
    }));

    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient 
          initialEvents={upcomingEvents || []}
          memberStats={stats}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
} 
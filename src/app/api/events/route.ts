import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    // Verify auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          title: json.title,
          description: json.description,
          date: json.date,
          time: json.time,
          location: json.location,
          recurring: json.recurring,
          recurring_pattern: json.recurring_pattern,
          created_by: session.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'upcoming';
    
    // Wait for cookies to be available
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    let query = supabase
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
      `);

    // Apply filter
    if (filter === 'upcoming') {
      query = query.gte('date', new Date().toISOString());
    } else if (filter === 'past') {
      query = query.lt('date', new Date().toISOString());
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;

    // Transform the data to ensure proper typing and count handling
    const transformedData = data.map(event => ({
      ...event,
      attendee_count: Number((event.attendee_count as any)?.[0]?.count || 0)
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
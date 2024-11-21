import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore) 
    });
    
    // Verify auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .match({ id: params.id });

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Also add PATCH endpoint for updating events
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore) 
    });
    
    // Verify auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({
        title: json.title,
        description: json.description,
        date: json.date,
        time: json.time,
        location: json.location,
        recurring: json.recurring,
        recurring_pattern: json.recurring_pattern,
      })
      .match({ id: params.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
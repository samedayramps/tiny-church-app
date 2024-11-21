import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { z } from 'zod';

// Validation schema for service times
const serviceTimesSchema = z.array(z.object({
  day: z.string(),
  time: z.string(),
  name: z.string().min(1, "Service name is required")
}));

export async function PUT(request: Request) {
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

    // Get and validate request body
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: 'Settings ID is required' },
        { status: 400 }
      );
    }
    
    // Validate service times
    const validatedTimes = serviceTimesSchema.safeParse(body.service_times);
    if (!validatedTimes.success) {
      return NextResponse.json(
        { 
          error: 'Invalid service times format',
          details: validatedTimes.error.format()
        },
        { status: 400 }
      );
    }

    // Update settings
    const { data, error } = await supabase
      .from('organization_settings')
      .update({
        service_times: validatedTimes.data,
        updated_at: new Date().toISOString(),
        last_updated_by: session.user.id
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: data 
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal Server Error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Add GET method for fetching settings
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
} 
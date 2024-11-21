import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ memberId: string }> }
) {
  try {
    // Await both cookies and params
    const [cookieStore, { memberId }] = await Promise.all([
      cookies(),
      context.params
    ]);

    // Create Supabase client with awaited cookieStore
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    const { data: groups, error } = await supabase
      .from('member_groups')
      .select(`
        groups (
          id,
          name,
          description,
          group_type,
          created_at
        )
      `)
      .eq('member_id', memberId);

    if (error) throw error;

    // Transform the data to get just the groups
    const memberGroups = groups
      .map(item => (item.groups as Database['public']['Tables']['groups']['Row']))
      .filter(Boolean);

    return NextResponse.json(memberGroups);
  } catch (error) {
    console.error('Error fetching member groups:', error);
    return NextResponse.json(
      { error: 'Error fetching member groups' },
      { status: 500 }
    );
  }
} 
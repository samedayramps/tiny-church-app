import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase();
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    let groupsQuery = supabase
      .from('groups')
      .select(`
        *,
        member_count:member_groups(count)
      `);

    // Apply search filter if query exists
    if (query) {
      groupsQuery = groupsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: groups, error } = await groupsQuery;

    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }

    const groupsWithCounts = groups.map(group => ({
      ...group,
      member_count: Number((group.member_count as any)?.[0]?.count || 0)
    }));

    return NextResponse.json(groupsWithCounts);
  } catch (error) {
    console.error('Error in GET /api/groups:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: body.name,
        description: body.description,
        group_type: body.group_type,
        created_at: body.created_at
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/groups:', error);
    return NextResponse.json(
      { 
        error: 'Error creating group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
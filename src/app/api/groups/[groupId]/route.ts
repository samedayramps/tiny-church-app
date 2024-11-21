import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

type GroupWithCount = Database['public']['Tables']['groups']['Row'] & {
  member_count: number;
};

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    const { groupId } = await params;
    
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        member_count:member_groups(count)
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Transform the count from the subquery with proper typing
    const groupWithCount: GroupWithCount = {
      ...(group as Database['public']['Tables']['groups']['Row']),
      member_count: Number((group as any).member_count?.[0]?.count || 0)
    };

    return NextResponse.json(groupWithCount);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Error fetching group' },
      { status: 500 }
    );
  }
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];
type MemberWithDetails = {
  member_id: string;
  members: Member;
};

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase();
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

    const { groupId } = await params;
    console.log(`Fetching members for group ${groupId}`);

    let membersQuery = supabase
      .from('member_groups')
      .select(`
        member_id,
        members!inner (*)
      `)
      .eq('group_id', groupId);

    if (query) {
      membersQuery = membersQuery.or(
        `members.first_name.ilike.%${query}%,` +
        `members.last_name.ilike.%${query}%,` +
        `members.email.ilike.%${query}%`
      );
    }

    const { data: memberData, error: memberError } = await membersQuery;

    if (memberError) {
      console.error('Error fetching group members:', memberError);
      throw memberError;
    }

    // Type assertion for memberData since we know its structure
    const members: MemberWithDetails[] = (memberData || []).map(item => ({
      member_id: (item as any).member_id,
      members: (item as any).members
    }));

    const memberIds = members.map(item => item.members.id);

    const { data: availableData, error: availableError } = await supabase
      .from('members')
      .select('*')
      .not('id', 'in', memberIds.length ? `(${memberIds.join(',')})` : '(0)');

    if (availableError) {
      console.error('Error fetching available members:', availableError);
      throw availableError;
    }

    return NextResponse.json({
      groupMembers: members.map(item => item.members),
      availableMembers: availableData
    });
  } catch (error) {
    console.error('Error in GET /api/groups/[groupId]/members:', error);
    return NextResponse.json(
      { error: 'Error fetching members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { memberId } = await request.json();
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    const { groupId } = await params;
    
    const { error } = await supabase
      .from('member_groups')
      .insert([{
        group_id: groupId,
        member_id: memberId
      }] as any); // Type assertion needed due to Supabase types

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Error adding member to group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { memberId } = await request.json();
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    const { groupId } = await params;
    
    const { error } = await supabase
      .from('member_groups')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Error removing member from group' },
      { status: 500 }
    );
  }
} 
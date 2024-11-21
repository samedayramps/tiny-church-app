import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];
type NewMember = Database['public']['Tables']['members']['Insert'];

export async function GET() {
  const { data, error } = await supabase.from('members').select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data as Member[]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const memberData: NewMember = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone || null,
      notes: body.notes || null,
      photo_url: body.photo_url || null,
      status: body.status || 'active',
      date_added: new Date().toISOString(),
      address: null,
      custom_fields: null
    };

    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
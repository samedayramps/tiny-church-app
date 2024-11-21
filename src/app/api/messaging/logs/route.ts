import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    // Create supabase client with admin privileges to bypass RLS
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const showTests = searchParams.get('showTests') === 'true';

    let query = supabase
      .from('email_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (!showTests) {
      query = query.eq('is_test', false);
    }
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    if (search) {
      query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, count, error } = await query
      .order('scheduled_for', { ascending: false, nullsFirst: true })
      .order('sent_at', { ascending: false, nullsFirst: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
} 
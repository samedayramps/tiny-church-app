import { Suspense } from 'react';
import { MembersClient } from './members-client';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];

// This becomes a server component that fetches data
export default async function MembersPage() {
  // Fetch members on the server
  const { data: members, error } = await supabase
    .from('members')
    .select('*');

  if (error) {
    throw error; // This will be caught by the error boundary
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembersClient initialMembers={members || []} />
    </Suspense>
  );
} 
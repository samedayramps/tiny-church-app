import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import type { OrganizationSettings } from '@/types/settings';

export async function getSettings(): Promise<OrganizationSettings> {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const { data: newSettings, error: createError } = await supabase
      .from('organization_settings')
      .insert([{
        church_name: 'My Church',
        email: 'default@example.com',
      }])
      .select()
      .single();

    if (createError) throw createError;
    return newSettings as OrganizationSettings;
  }

  return data as OrganizationSettings;
}

export async function updateSettings(
  id: string, 
  updates: Partial<Database['public']['Tables']['organization_settings']['Update']>
) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  const { error } = await supabase
    .from('organization_settings')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
} 
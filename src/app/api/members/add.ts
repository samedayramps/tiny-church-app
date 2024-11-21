import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type NewMember = Database['public']['Tables']['members']['Insert'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { first_name, last_name, email, status, phone, notes, photo_url } = req.body;
    
    const memberData: NewMember = {
      first_name,
      last_name,
      email,
      status: status || 'active',
      phone: phone || null,
      notes: notes || null,
      photo_url: photo_url || null,
      date_added: new Date().toISOString(),
      address: null,
      custom_fields: null
    };

    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 
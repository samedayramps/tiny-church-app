import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

async function seed() {
  try {
    console.log('Starting seed...');

    // Clear existing data
    await supabase.from('member_groups').delete().neq('member_id', '');
    await supabase.from('members').delete().neq('id', '');
    await supabase.from('groups').delete().neq('id', '');

    // Insert members
    const members = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0101',
        status: 'active',
        date_added: new Date().toISOString(),
        address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' },
        custom_fields: { ministry: 'youth', baptized: true, leadership: true },
        notes: 'Youth ministry leader'
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0102',
        status: 'active',
        date_added: new Date().toISOString(),
        address: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345' },
        custom_fields: { ministry: 'worship', instruments: ['piano', 'vocals'] },
        notes: 'Worship team member'
      },
      // ... add more members with full details
    ];

    const { data: insertedMembers, error: membersError } = await supabase
      .from('members')
      .insert(members)
      .select();

    if (membersError) throw membersError;
    console.log('Members inserted:', insertedMembers.length);

    // Insert groups
    const groups = [
      {
        name: 'Youth Ministry',
        description: 'For members aged 13-18, focusing on spiritual growth and fellowship',
        group_type: 'ministry',
        created_at: new Date().toISOString()
      },
      {
        name: 'Worship Team',
        description: 'Musicians and vocalists leading Sunday worship services',
        group_type: 'ministry',
        created_at: new Date().toISOString()
      },
      // ... add more groups
    ];

    const { data: insertedGroups, error: groupsError } = await supabase
      .from('groups')
      .insert(groups)
      .select();

    if (groupsError) throw groupsError;
    console.log('Groups inserted:', insertedGroups.length);

    // Create member-group relationships
    const memberGroups = [
      {
        member_id: insertedMembers[0].id, // John Doe
        group_id: insertedGroups[0].id    // Youth Ministry
      },
      {
        member_id: insertedMembers[1].id, // Jane Smith
        group_id: insertedGroups[1].id    // Worship Team
      },
      // ... add more relationships
    ];

    const { error: relationshipError } = await supabase
      .from('member_groups')
      .insert(memberGroups);

    if (relationshipError) throw relationshipError;
    console.log('Member-group relationships created');

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seed(); 
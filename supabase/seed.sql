-- Clean existing data
TRUNCATE public.member_groups CASCADE;
TRUNCATE public.members CASCADE;
TRUNCATE public.groups CASCADE;

-- Insert members
INSERT INTO public.members (first_name, last_name, email, phone, status, date_added)
VALUES
  ('John', 'Doe', 'john.doe@example.com', '555-0101', 'active', '2024-01-15T08:00:00Z'),
  ('Jane', 'Smith', 'jane.smith@example.com', '555-0102', 'active', '2024-01-15T08:00:00Z'),
  ('Michael', 'Johnson', 'michael.j@example.com', '555-0103', 'active', '2024-01-15T08:00:00Z'),
  ('Sarah', 'Williams', 'sarah.w@example.com', '555-0104', 'active', '2024-01-15T08:00:00Z'),
  ('David', 'Brown', 'david.b@example.com', '555-0105', 'active', '2024-01-15T08:00:00Z'),
  ('Emily', 'Davis', 'emily.d@example.com', '555-0106', 'active', '2024-01-15T08:00:00Z'),
  ('James', 'Miller', 'james.m@example.com', '555-0107', 'active', '2024-01-15T08:00:00Z'),
  ('Lisa', 'Wilson', 'lisa.w@example.com', '555-0108', 'active', '2024-01-15T08:00:00Z'),
  ('Robert', 'Taylor', 'robert.t@example.com', '555-0109', 'active', '2024-01-15T08:00:00Z'),
  ('Emma', 'Anderson', 'emma.a@example.com', '555-0110', 'active', '2024-01-15T08:00:00Z');

-- Insert groups
INSERT INTO public.groups (name, description, group_type, created_at)
VALUES
  (
    'Youth Ministry',
    'For members aged 13-18, focusing on spiritual growth and fellowship',
    'ministry',
    '2024-01-15T08:00:00Z'
  ),
  (
    'Worship Team',
    'Musicians and vocalists leading Sunday worship services',
    'ministry',
    '2024-01-15T08:30:00Z'
  ),
  (
    'Women''s Fellowship',
    'A community of women supporting each other in faith and life',
    'fellowship',
    '2024-01-16T09:00:00Z'
  ),
  (
    'Men''s Bible Study',
    'Weekly scripture study and discussion group for men',
    'study',
    '2024-01-16T09:30:00Z'
  ),
  (
    'Tech Team',
    'Managing audio/visual and online presence',
    'service',
    '2024-01-19T12:30:00Z'
  );

-- Insert member-group associations
-- We'll need to use a more complex query to get the IDs
WITH member_ids AS (
  SELECT id, first_name, last_name FROM members
),
group_ids AS (
  SELECT id, name FROM groups
)
INSERT INTO public.member_groups (member_id, group_id)
SELECT 
  m.id as member_id,
  g.id as group_id
FROM
  member_ids m,
  group_ids g
WHERE
  -- Youth Ministry
  (g.name = 'Youth Ministry' AND m.first_name IN ('John', 'Jane', 'Michael'))
  OR
  -- Worship Team
  (g.name = 'Worship Team' AND m.first_name IN ('Sarah', 'David', 'Emily'))
  OR
  -- Women's Fellowship
  (g.name = 'Women''s Fellowship' AND m.first_name IN ('Jane', 'Sarah', 'Emily', 'Lisa', 'Emma'))
  OR
  -- Men's Bible Study
  (g.name = 'Men''s Bible Study' AND m.first_name IN ('John', 'Michael', 'David', 'James', 'Robert'))
  OR
  -- Tech Team
  (g.name = 'Tech Team' AND m.first_name IN ('David', 'James', 'Robert'));

-- Add more tables as needed (events, event_attendees, etc.) 
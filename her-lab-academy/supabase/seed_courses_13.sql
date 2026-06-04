-- Seeds all 12 HER Lab Academy courses with correct prefixes.
-- Safe to re-run: uses ON CONFLICT (title) DO UPDATE so existing rows are updated.

begin;

insert into courses (title, description, category, cover_emoji, duration_weeks, is_published, enrollment_code)
values
  ('Electrical Installation',   'Practical electrical installation training covering wiring, circuits, and safety.', 'Trades',       '⚡', 10, true, 'EL12345'),
  ('Solar PV Installation',     'Hands-on solar photovoltaic installation and maintenance training.',                 'Trades',       '☀️', 10, true, 'SP12345'),
  ('Plumbing',                  'Practical plumbing training covering piping, fixtures, and water systems.',         'Trades',       '🔧', 10, true, 'PL12345'),
  ('Cosmetology',               'Professional cosmetology training in hair, skin, and nail care.',                   'Health',       '💄', 10, true, 'CT12345'),
  ('Fashion Design',            'Vocational fashion design training covering garment construction and styling.',     'Vocational',   '🪡', 10, true, 'FD12345'),
  ('Regenerative Agriculture',  'Training in sustainable, regenerative farming practices.',                          'Agriculture',  '🌱', 10, true, 'RA12345'),
  ('Core Agriculture',          'Foundational agriculture skills for smallholder farmers.',                          'Agriculture',  '🌾', 10, true, 'CA12345'),
  ('Reproductive Health',       'Comprehensive reproductive health education and awareness.',                        'Health',       '❤️', 10, true, 'RH12345'),
  ('ICT',                       'Information and Communication Technology fundamentals and practical skills.',       'Technology',   '💻', 10, true, 'IT12345'),
  ('Basic Digital Literacy',    'Entry-level digital literacy for smartphones, internet, and basic software.',       'Technology',   '📱', 10, true, 'DL12345'),
  ('Entrepreneurship',          'Business skills, financial literacy, and entrepreneurship training.',               'Business',     '💼', 10, true, 'EP12345'),
  ('Beadwork',                  'Traditional and contemporary beadwork craft and income-generating skills.',         'Vocational',   '📿', 10, true, 'BW12345')
on conflict (title) do update set
  description     = excluded.description,
  category        = excluded.category,
  cover_emoji     = excluded.cover_emoji,
  duration_weeks  = excluded.duration_weeks,
  is_published    = excluded.is_published,
  enrollment_code = excluded.enrollment_code;

commit;

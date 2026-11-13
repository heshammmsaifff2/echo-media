-- Migration: preview toggle and studio contact
alter table public.client_orders
  add column if not exists preview_unlocked boolean not null default true;

-- Default studio contact settings
insert into public.site_settings (key, value)
values ('contact_studio', jsonb_build_object(
  'email', 'studio@echomedia.production',
  'phones', jsonb_build_array(
    jsonb_build_object(
      'number', '+20 123 456 7891',
      'label', jsonb_build_object('en', 'Studio Bookings', 'ar', 'حجوزات الاستوديو'),
      'whatsapp', true
    )
  ),
  'social', jsonb_build_array(
    jsonb_build_object('name', 'Instagram', 'url', 'https://instagram.com/'),
    jsonb_build_object('name', 'Facebook', 'url', 'https://facebook.com/'),
    jsonb_build_object('name', 'TikTok', 'url', 'https://tiktok.com/')
  )
))
on conflict (key) do nothing;


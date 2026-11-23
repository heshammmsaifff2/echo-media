-- Per-order download window, so the admin can extend it past the default 7 days.
alter table public.client_orders
  add column if not exists delivery_days integer not null default 7
  check (delivery_days between 1 and 365);

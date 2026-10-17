-- Work previews visible before full payment, and per-order contract terms.
alter table public.client_orders
  add column if not exists preview_files jsonb not null default '[]'::jsonb,
  add column if not exists terms text,
  add column if not exists terms_accepted_at timestamptz;

-- Clients may only submit receipts once they have accepted the order's terms.
drop policy if exists "Clients add receipt payments" on public.order_payments;
create policy "Clients add receipt payments" on public.order_payments
  for insert with check (
    created_by = 'client' and is_confirmed = false and is_cash = false
    and order_id in (
      select id from public.client_orders
      where client_id = auth.uid() and (terms is null or terms_accepted_at is not null)
    )
  );

-- Default terms the admin can edit; copied into each new order.
insert into public.site_settings (key, value)
values ('order_terms', jsonb_build_object('text', ''))
on conflict (key) do nothing;

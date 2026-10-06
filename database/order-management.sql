alter table public.client_orders add column if not exists cancelled_at timestamptz;

create or replace function public.guard_order_management()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare paid numeric;
begin
  if current_user not in ('postgres', 'service_role') and not coalesce(public.is_admin(), false)
     and row(new.cancelled_at, new.client_id, new.project_title, new.project_description, new.total_amount, new.is_confirmed_by_admin, new.delivery_unlocked_at)
       is distinct from row(old.cancelled_at, old.client_id, old.project_title, old.project_description, old.total_amount, old.is_confirmed_by_admin, old.delivery_unlocked_at) then
    raise exception 'Only administrators can edit or cancel orders';
  end if;
  if old.cancelled_at is not null and row(new.client_id, new.project_title, new.project_description, new.total_amount)
      is distinct from row(old.client_id, old.project_title, old.project_description, old.total_amount) then
    raise exception 'Cancelled orders cannot be edited';
  end if;
  if new.total_amount is distinct from old.total_amount then
    select coalesce(sum(amount), 0) into paid from public.order_payments where order_id = old.id and is_confirmed;
    if new.total_amount < 0 or new.total_amount < paid then
      raise exception 'Order total cannot be negative or below confirmed payments';
    end if;
  end if;
  if new.client_id is distinct from old.client_id and exists(select 1 from public.order_payments where order_id = old.id) then
    raise exception 'Cannot change the client of an order with payments';
  end if;
  if new.cancelled_at is not null then
    new.is_confirmed_by_admin := false;
    new.delivery_unlocked_at := null;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_order_management on public.client_orders;
create trigger guard_order_management before update on public.client_orders for each row execute function public.guard_order_management();

create or replace function public.guard_cancelled_order_payment()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare cancellation timestamptz; target_order uuid;
begin
  if tg_op = 'UPDATE' and old.order_id is distinct from new.order_id then
    select cancelled_at into cancellation from public.client_orders where id = old.order_id for update;
    if cancellation is not null then
      raise exception 'Cannot change payments for a cancelled order';
    end if;
  end if;
  target_order := case when tg_op = 'DELETE' then old.order_id else new.order_id end;
  select cancelled_at into cancellation from public.client_orders where id = target_order for update;
  if cancellation is not null then
    raise exception 'Cannot change payments for a cancelled order';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists guard_cancelled_order_payment on public.order_payments;
create trigger guard_cancelled_order_payment before insert or update or delete on public.order_payments for each row execute function public.guard_cancelled_order_payment();


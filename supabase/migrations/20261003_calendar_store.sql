begin;
create table if not exists public.aa_events (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title)>0), description text not null default '', category text not null default 'Otras actividades', start_at timestamptz not null, end_at timestamptz, all_day boolean not null default false, place text not null default '', address text not null default '', online_url text not null default '', image_url text not null default '', status text not null default 'draft' check(status in ('draft','published')), check(end_at is null or end_at>=start_at));
create table if not exists public.aa_products (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title)>0), author text not null default '', description text not null default '', category text not null default '', kind text not null check(kind in ('physical','ebook')), price numeric(12,2) not null check(price>0), stock integer not null default 0 check(stock>=0), image_url text not null default '', ebook_path text not null default '', status text not null default 'draft' check(status in ('draft','published')),
 check(kind!='ebook' or status!='published' or length(ebook_path)>0));
create table if not exists public.aa_orders (
 id uuid primary key default gen_random_uuid(), access_hash text not null, buyer_name text not null, buyer_email text not null, delivery text not null, address text not null default '', product_id uuid not null references public.aa_products(id), quantity integer not null check(quantity between 1 and 10), product_title text not null, kind text not null, ebook_path text not null default '', unit_price numeric(12,2) not null, shipping numeric(12,2) not null default 0, total numeric(12,2) not null, status text not null default 'pending', preference_id text, payment_id text unique, stock_applied boolean not null default false, fulfillment text not null default 'pending' check(fulfillment in ('pending','ready','sent','complete')), created_at timestamptz not null default now());
-- Browser access is deliberately denied: the isolated Edge Function validates permissions.
alter table public.aa_events enable row level security;
alter table public.aa_products enable row level security;
alter table public.aa_orders enable row level security;
revoke all on public.aa_events, public.aa_products, public.aa_orders from anon,authenticated;
grant all on public.aa_events, public.aa_products, public.aa_orders to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('store-ebooks','store-ebooks',false,52428800,array['application/pdf']) on conflict(id) do nothing;
create or replace function public.aa_apply_payment(p_order uuid,p_payment text,p_status text) returns void language plpgsql security definer set search_path=public as $$
declare o aa_orders; available integer;
begin
 select * into o from aa_orders where id=p_order for update;
 if not found then raise exception 'Pedido inexistente'; end if;
 if o.payment_id is not null and o.payment_id!=p_payment then raise exception 'Otro pago asociado'; end if;
 if p_status='approved' then
   if o.status in ('refunded','charged_back') then return; end if;
   if o.kind='physical' and not o.stock_applied then
     select stock into available from aa_products where id=o.product_id for update;
     if available<o.quantity then
       update aa_orders set status='paid_review',payment_id=p_payment where id=p_order; return;
     end if;
     update aa_products set stock=stock-o.quantity where id=o.product_id;
     update aa_orders set stock_applied=true where id=p_order;
   end if;
   update aa_orders set status='approved',payment_id=p_payment where id=p_order;
 elsif p_status in ('refunded','charged_back') then
   if o.stock_applied then update aa_products set stock=stock+o.quantity where id=o.product_id; end if;
   update aa_orders set status=p_status,payment_id=p_payment,stock_applied=false where id=p_order;
 elsif o.status not in ('approved','paid_review','refunded','charged_back') then
   update aa_orders set status=p_status where id=p_order;
 end if;
end $$;
revoke all on function public.aa_apply_payment(uuid,text,text) from public,anon,authenticated;
grant execute on function public.aa_apply_payment(uuid,text,text) to service_role;
commit;
notify pgrst,'reload schema';

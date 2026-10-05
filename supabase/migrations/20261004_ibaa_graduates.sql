begin;
create table if not exists public.ibaa_graduates (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 200),
 institute text not null default 'IBAA',
 graduation_year integer not null check(graduation_year between 1900 and 2200),
 document_number text not null default '',
 average numeric(4,2) check(average between 0 and 10),
 certificate_url text not null default '',
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now(),
 unique(graduation_year,institute,name),
 check(status!='published' or certificate_url ~ '^https?://')
);
alter table public.ibaa_graduates enable row level security;
revoke all on public.ibaa_graduates from anon,authenticated;
grant all on public.ibaa_graduates to service_role;
create or replace function public.ibaa_graduate_years() returns table(year integer)
language sql security definer set search_path=public as $$
 select distinct graduation_year from ibaa_graduates where status='published' order by graduation_year desc;
$$;
revoke all on function public.ibaa_graduate_years() from public,anon,authenticated;
grant execute on function public.ibaa_graduate_years() to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ibaa-certificates','ibaa-certificates',true,20971520,array['application/pdf']) on conflict(id) do nothing;
commit;
notify pgrst,'reload schema';

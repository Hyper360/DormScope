-- for use in Supabase
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  price_cents integer not null check (price_cents > 0),
  price_period text not null check (price_period in ('month', 'year')),
  distance_km numeric(4, 1) check (distance_km >= 0),
  max_roommates integer check (max_roommates between 0 and 10),
  has_kitchen boolean not null default false,
  utilities_included boolean not null default false,
  furnished boolean not null default false,
  room_type text,
  availability_note text,
  description text not null,
  image_url text,
  image_alt text,
  listed_by text,
  amenities text[] not null default '{}',
  house_rules text[] not null default '{}',
  utilities text[] not null default '{}',
  summary_details text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- These statements also add the fields if the table was created before this
-- version of the schema.
alter table public.listings
  add column if not exists utilities text[] not null default '{}';

alter table public.listings
  add column if not exists summary_details text[] not null default '{}';

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 20 and 1000),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;
alter table public.reviews enable row level security;

create policy "public can read listings"
on public.listings
for select
to anon, authenticated
using (true);

create policy "public can read reviews"
on public.reviews
for select
to anon, authenticated
using (true);

create policy "visitors create their own reviews"
on public.reviews
for insert
to authenticated
with check (user_id = auth.uid());

create policy "visitors update their own reviews"
on public.reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "visitors delete their own reviews"
on public.reviews
for delete
to authenticated
using (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.listings to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
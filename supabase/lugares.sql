-- cabeça do Diego · aba "Lugares para Visitar"
-- Rode DEPOIS do schema.sql (serve para bancos novos e já existentes).

-- 1) Banco geográfico: uma linha por cidade (reaproveitável por qualquer seção)
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state text not null default '',
  country text not null default 'Brasil',
  created_at timestamptz default now()
);
create unique index if not exists cities_key on cities (lower(city), lower(state), lower(country));
create index if not exists cities_city_trgm on cities using gin (city gin_trgm_ops);

-- Aproveita as origens já cadastradas nas ervas (empresas e produtos)
insert into cities (city, state, country)
select distinct trim(city), coalesce(trim(state), ''), coalesce(nullif(trim(country), ''), 'Brasil')
from (select city, state, country from companies union all select city, state, country from products) t
where nullif(trim(city), '') is not null
on conflict do nothing;

create or replace function search_cities(q text)
returns table (id uuid, city text, state text, country text)
language sql stable as $$
  select c.id, c.city, c.state, c.country from cities c
  where c.city ilike q || '%' or similarity(c.city, q) > 0.3
  order by similarity(c.city, q) desc, c.city
  limit 8;
$$;

-- 2) Locais. As subdivisões são linhas de `categories` da seção "lugares".
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id),
  city_id uuid references cities(id),
  name text not null,
  maps_url text not null check (
    maps_url ~* '^https://((www\.|maps\.)?google\.(com(\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})/maps|maps\.google\.(com(\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})/|maps\.app\.goo\.gl/|goo\.gl/maps)'
  ),
  photo_url text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists places_category_idx on places (category_id);
create index if not exists places_city_idx on places (city_id);

-- 3) Segurança
alter table cities enable row level security;
alter table places enable row level security;
create policy "leitura" on cities for select using (true);
create policy "leitura" on places for select using (true);
create policy "escrita" on cities for all to authenticated using (true) with check (true);
create policy "escrita" on places for all to authenticated using (true) with check (true);
-- Permite criar/editar subdivisões pelo app (antes só leitura)
create policy "escrita" on categories for all to authenticated using (true) with check (true);

-- 4) Seção ativa + subdivisões iniciais
alter table sections add column if not exists show_all boolean default false;
update sections set name = 'Lugares para Visitar', is_active = true, show_all = true where slug = 'lugares';

insert into categories (section_id, slug, name, sort_order)
select s.id, v.slug, v.name, v.ord
from sections s,
     (values ('restaurantes','Restaurantes',1), ('parques','Parques',2), ('museus','Museus',3), ('mirantes','Mirantes',4)) as v(slug, name, ord)
where s.slug = 'lugares'
on conflict (section_id, slug) do nothing;

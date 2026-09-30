-- cabeça do Diego · schema completo (rode no SQL Editor do Supabase)
create extension if not exists pg_trgm;

-- Seções = abas do menu. Nova aba = nova linha aqui.
create table sections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int default 0,
  is_active boolean default true      -- false = aparece como "em breve"
);

-- Subcategorias de cada seção (Chimarrão / Tererê)
create table categories (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int default 0,
  unique (section_id, slug)
);

-- Empresas: a origem fica aqui e preenche sozinha no cadastro
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  country text default 'Brasil',
  website text,
  created_at timestamptz default now()
);
create unique index companies_name_key on companies (lower(name));
create index companies_name_trgm on companies using gin (name gin_trgm_ops);

-- Produtos (as ervas)
create table products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  category_id uuid not null references categories(id),
  name text not null,
  photo_url text,
  rating numeric(2,1) check (rating is null or (rating between 0.5 and 5 and rating * 2 = floor(rating * 2))),
  description text,
  city text,
  state text,
  country text,
  created_at timestamptz default now(),
  unique (company_id, category_id, name)
);
create index products_category_idx on products (category_id);

-- Autocomplete de empresa (tolera erro de digitação)
create or replace function search_companies(q text)
returns table (id uuid, name text, city text, state text, country text, product_count bigint)
language sql stable as $$
  select c.id, c.name, c.city, c.state, c.country,
         (select count(*) from products p where p.company_id = c.id)
  from companies c
  where c.name ilike '%' || q || '%' or similarity(c.name, q) > 0.25
  order by similarity(c.name, q) desc, c.name
  limit 8;
$$;

-- Segurança: todos leem, só usuário logado escreve
alter table sections   enable row level security;
alter table categories enable row level security;
alter table companies  enable row level security;
alter table products   enable row level security;

create policy "leitura" on sections   for select using (true);
create policy "leitura" on categories for select using (true);
create policy "leitura" on companies  for select using (true);
create policy "leitura" on products   for select using (true);
create policy "escrita" on companies  for all to authenticated using (true) with check (true);
create policy "escrita" on products   for all to authenticated using (true) with check (true);

-- Bucket de fotos
insert into storage.buckets (id, name, public) values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;
create policy "fotos leitura" on storage.objects for select using (bucket_id = 'product-photos');
create policy "fotos upload"  on storage.objects for insert to authenticated with check (bucket_id = 'product-photos');

-- Dados iniciais
insert into sections (slug, name, sort_order, is_active) values
  ('erva-mate',  'Erva-mate',          1, true),
  ('lugares',    'Lugares onde comer', 2, false),
  ('acessorios', 'Acessórios',         3, false);

insert into categories (section_id, slug, name, sort_order)
select id, 'chimarrao', 'Chimarrão', 1 from sections where slug = 'erva-mate';
insert into categories (section_id, slug, name, sort_order)
select id, 'terere', 'Tererê', 2 from sections where slug = 'erva-mate';

# cabeça do Diego

Catálogo de erva-mate (Chimarrão e Tererê) em Next.js 14 + Supabase, com menu modular para novas abas.

## Como rodar

1. Crie um projeto em https://supabase.com e cole o conteúdo de `supabase/schema.sql` no SQL Editor (cria tabelas, segurança, bucket de fotos e dados iniciais).
2. Em Authentication > Users, crie o seu usuário (e-mail e senha). Só usuários logados cadastram.
3. Copie `.env.example` para `.env.local` e preencha a URL e a anon key (Project Settings > API).
4. `npm install` e `npm run dev`, depois abra http://localhost:3000.

## Nova aba no menu

- Só mudar dados: `update sections set is_active = true where slug = 'lugares';`
- Aba com campos próprios (ex.: restaurantes): crie a tabela e uma pasta `src/app/lugares/page.tsx`. Rotas estáticas têm prioridade sobre `[section]`.
- Aba no mesmo molde empresa + produto (ex.: acessórios): insira em `sections` e `categories`, sem mexer no código.

## Importar portfólios em lote

Coloque um JSON por marca em `data/portfolios/` (veja `marca-exemplo.json`), defina `SUPABASE_SERVICE_KEY` no `.env.local` e rode `npm run import`. Pode rodar várias vezes sem duplicar.

## Já criou o banco antes da nota e da descrição?

Rode no SQL Editor:

```sql
alter table products
  add column rating numeric(2,1) check (rating is null or (rating between 0.5 and 5 and rating * 2 = floor(rating * 2))),
  add column description text;
```

## Aba "Lugares para Visitar"

Rode `supabase/lugares.sql` no SQL Editor (depois do `schema.sql`). Ele cria as tabelas `cities` e `places`, ativa a aba e cria as subdivisões Restaurantes, Parques, Museus e Mirantes. Novas subdivisões podem ser criadas direto no cadastro do local ("+ Nova subdivisão...").

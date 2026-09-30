# Como este site funciona (leia antes de mexer)

O `index.html` na raiz é um catálogo **só de leitura**, publicado pelo GitHub Pages.
Ele lê o arquivo `data/db.json` deste mesmo repositório e as fotos da pasta `photos/`.

Não existe formulário nem senha na página: por segurança, uma chave capaz de
gravar dados não pode ficar dentro de uma página pública (o GitHub detecta e
revoga automaticamente qualquer chave exposta assim).

**Para cadastrar, editar ou remover algo:** peça no chat do Claude. As
alterações são enviadas para este repositório e a página se atualiza sozinha
em até ~20 segundos, em qualquer aparelho que esteja com ela aberta.

O projeto Next.js + Supabase (pasta `src/`, `supabase/`) continua no
repositório caso você prefira migrar para um site com cadastro público de
verdade (login e senha reais) no futuro.

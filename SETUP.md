# Configurando o sistema de gestão (`/app`)

Este painel roda inteiramente como site estático (compatível com GitHub Pages) e usa o
[Supabase](https://supabase.com) como backend (banco de dados + autenticação + permissões).
Siga os passos abaixo uma única vez para colocar no ar.

## 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em https://supabase.com e clique em **New project**.
2. Escolha um nome, uma senha de banco (guarde-a) e a região mais próxima.
3. Aguarde o projeto ser provisionado (leva ~2 minutos).

## 2. Rodar o schema do banco

1. No painel do Supabase, abra **SQL Editor**.
2. Cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste
   repositório e clique em **Run**.
   - Isso cria as tabelas (`clients`, `boards`, `stages`, `tasks`, `profiles`, etc.), as
     regras de permissão (Row Level Security) e os gatilhos automáticos.

## 3. Configurar autenticação por e-mail/senha

1. Vá em **Authentication → Providers** e confirme que **Email** está habilitado (vem
   habilitado por padrão).
2. Se quiser liberar o cadastro sem exigir confirmação de e-mail (mais simples para um
   time pequeno e de confiança), vá em **Authentication → Settings** e desative
   "Confirm email". Caso contrário, cada novo usuário precisará clicar no link recebido
   por e-mail antes do primeiro login.

## 4. Pegar a URL e a chave pública do projeto

1. Vá em **Project Settings → API**.
2. Copie **Project URL** e a chave **anon public**.
3. Abra [`app/js/config.js`](./app/js/config.js) neste repositório e substitua:

   ```js
   export const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
   export const SUPABASE_ANON_KEY = "SUA-ANON-KEY-AQUI";
   ```

   A chave "anon" é segura para ficar pública no front-end — quem protege os dados de
   verdade são as políticas de RLS já criadas no passo 2, não o segredo da chave.

## 5. Publicar

Faça commit e push do repositório (GitHub Pages já publica automaticamente). O painel
ficará disponível em:

```
https://SEU-USUARIO.github.io/app/
```

## 6. Criar o primeiro administrador

1. Acesse `https://SEU-USUARIO.github.io/app/`, clique em **Criar conta** e cadastre-se
   com seu e-mail.
2. No Supabase, vá em **SQL Editor** e rode (trocando pelo seu e-mail):

   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
   ```

3. Faça login novamente. Você agora verá o menu **Equipe & Permissões**.

## 7. Adicionar sua equipe

1. Peça para cada colaborador acessar o link e clicar em **Criar conta**.
2. Por padrão, todo novo usuário entra como **Membro**, sem acesso a nenhum cliente ou
   quadro — ele só verá o que você liberar.
3. Em **Clientes & Quadros**, use o botão **Acesso** em cada quadro para marcar quais
   pessoas podem vê-lo e editá-lo.
4. Em **Equipe & Permissões**, você pode promover alguém a **Administrador** (acesso
   total a tudo) quando fizer sentido.

## Como o sistema está organizado

- **Clientes**: cada cliente ganha automaticamente um quadro de conteúdo com pipeline
  padrão (Briefing → Roteiro/Copy → Produção → Revisão → Aprovação → Publicado).
- **Projetos paralelos**: dentro de um cliente, crie quadros extras (ex: "Criação de
  Rótulos") com suas próprias colunas.
- **Administrativo**: quadros sem cliente associado, para demandas internas da agência
  (financeiro, RH, etc.).
- **Campos personalizados**: qualquer tarefa aceita campos extras livres (nome + valor),
  sem precisar mexer no banco — use para o que for específico de cada projeto.
- **Visão Geral**: tabela com todas as tarefas que você tem permissão de ver, de todos os
  clientes e quadros, com filtros por cliente, tipo, status e prazo — essa é a visão
  "macro" da agência inteira.
- **Permissões**: controladas por quadro. Um administrador decide, quadro a quadro, quem
  tem acesso. Quem não foi adicionado a um quadro simplesmente não o vê (reforçado no
  banco de dados via Row Level Security, não apenas na interface).

## Limitações conhecidas (MVP)

- Sem upload de arquivos/anexos nas tarefas (pode ser adicionado depois com o Supabase
  Storage).
- Sem notificações por e-mail de prazos.
- Drag-and-drop dentro de uma coluna não reordena a posição fina (arrastar entre colunas
  funciona; reordenar dentro da mesma coluna ainda não).

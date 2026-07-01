-- ============================================================================
-- Schema do sistema de gestão de conteúdo e projetos (app/)
-- Execute este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PERFIS (espelham auth.users com papel de acesso: admin ou member)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- Cria automaticamente um perfil (role = member) sempre que alguém se cadastra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Torna o primeiro usuário administrador (rode manualmente depois do 1º cadastro):
-- update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';

-- ---------------------------------------------------------------------------
-- Funções auxiliares para políticas de acesso (RLS)
-- ---------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create function public.has_board_access(b_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.board_members
    where board_id = b_id and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- CLIENTES
-- ---------------------------------------------------------------------------
create table public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#F7C948',
  archived   boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- QUADROS (boards) — 'content' (pipeline de conteúdo de um cliente),
-- 'admin' (demandas administrativas da agência) ou 'custom' (projetos
-- paralelos, ex: criação de rótulos)
-- ---------------------------------------------------------------------------
create table public.boards (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null default 'custom' check (type in ('content', 'admin', 'custom')),
  client_id  uuid references public.clients (id) on delete set null,
  archived   boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Quem, além do admin, pode ver/editar este quadro
create table public.board_members (
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id  uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

-- ---------------------------------------------------------------------------
-- ETAPAS DO PIPELINE (colunas do kanban de cada quadro)
-- ---------------------------------------------------------------------------
create table public.stages (
  id       uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name     text not null,
  position int not null default 0,
  color    text not null default '#94A3B8'
);

-- ---------------------------------------------------------------------------
-- TAREFAS / CARDS
-- custom_fields (jsonb) permite adicionar campos extras por tarefa sem
-- precisar alterar o banco — ex: "Código do rótulo", "Fornecedor", etc.
-- ---------------------------------------------------------------------------
create table public.tasks (
  id                uuid primary key default gen_random_uuid(),
  board_id          uuid not null references public.boards (id) on delete cascade,
  stage_id          uuid not null references public.stages (id) on delete cascade,
  title             text not null,
  description       text,
  deadline          date,
  priority          text not null default 'media' check (priority in ('baixa', 'media', 'alta')),
  production_status text not null default 'nao_iniciado'
                       check (production_status in ('nao_iniciado', 'em_producao', 'em_revisao', 'aprovado', 'publicado')),
  assignee_id       uuid references public.profiles (id),
  custom_fields     jsonb not null default '{}'::jsonb,
  position          int not null default 0,
  created_by        uuid references public.profiles (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.clients       enable row level security;
alter table public.boards        enable row level security;
alter table public.board_members enable row level security;
alter table public.stages        enable row level security;
alter table public.tasks         enable row level security;

-- profiles: qualquer usuário autenticado pode ver o diretório da equipe
-- (nome/e-mail dos colegas é necessário para atribuir responsáveis às
-- tarefas); só o admin pode editar papéis.
create policy profiles_select on public.profiles
  for select using (auth.uid() is not null);
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- clients: admin vê tudo; membro vê clientes cujo quadro ele tem acesso
create policy clients_select on public.clients
  for select using (
    public.is_admin() or exists (
      select 1 from public.boards b
      where b.client_id = clients.id and public.has_board_access(b.id)
    )
  );
create policy clients_write on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

-- boards: visível para admin ou membros do quadro
create policy boards_select on public.boards
  for select using (public.is_admin() or public.has_board_access(id));
create policy boards_write on public.boards
  for all using (public.is_admin()) with check (public.is_admin());

-- board_members: admin gerencia; qualquer membro do quadro vê a lista
-- completa de colegas com acesso (necessário para o seletor de responsável)
create policy board_members_select on public.board_members
  for select using (public.has_board_access(board_id));
create policy board_members_write on public.board_members
  for all using (public.is_admin()) with check (public.is_admin());

-- stages: qualquer membro do quadro pode ver e gerenciar as colunas
create policy stages_select on public.stages
  for select using (public.has_board_access(board_id));
create policy stages_write on public.stages
  for all using (public.has_board_access(board_id)) with check (public.has_board_access(board_id));

-- tasks: qualquer membro do quadro pode ver e gerenciar as tarefas
create policy tasks_select on public.tasks
  for select using (public.has_board_access(board_id));
create policy tasks_write on public.tasks
  for all using (public.has_board_access(board_id)) with check (public.has_board_access(board_id));

-- ---------------------------------------------------------------------------
-- Índices úteis
-- ---------------------------------------------------------------------------
create index tasks_board_stage_idx on public.tasks (board_id, stage_id, position);
create index tasks_deadline_idx on public.tasks (deadline);
create index boards_client_idx on public.boards (client_id);
create index stages_board_idx on public.stages (board_id, position);

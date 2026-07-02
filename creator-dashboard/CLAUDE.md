@AGENTS.md

# Painel de Conteúdo — @tres.ag

Dashboard interno para operação de criador de conteúdo. Seis páginas: Hook Vault,
Analytics, Concorrentes, Agendador, Calendário e Em Alta.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) — cada página é uma rota estática
  em `app/<rota>/page.tsx`.
- **Tailwind CSS v4** — config *CSS-first* (`@theme inline` em `app/globals.css`), sem
  `tailwind.config.ts`. Tokens de cor em `oklch()`.
- **shadcn/ui** — os componentes em `components/ui/` foram **escritos manualmente**
  seguindo a convenção padrão do shadcn (`new-york` style, Radix + `class-variance-authority`
  + `tailwind-merge`), em vez de rodar `npx shadcn add`. O sandbox deste ambiente bloqueia
  `ui.shadcn.com`, então o CLI de init/add não funciona aqui. `components.json` já está
  configurado corretamente — em uma máquina com acesso à internet liberado,
  `npx shadcn@latest add <componente>` volta a funcionar normalmente e deve substituir
  qualquer componente que for adicionado depois.
- **Recharts** — gráfico de linha em Analytics.
- **lucide-react** — ícones. Atenção: versões recentes removeram ícones de marca
  (`Instagram`, `Youtube`, `TikTok` etc. não existem mais no pacote); plataformas são
  identificadas só por texto/badge.

## Estrutura

```
app/
  layout.tsx        # shell raiz: <html class="dark">, sidebar + main
  page.tsx           # redirect("/hook-vault")
  hook-vault/
  analytics/
  concorrentes/
  agendador/
  calendario/
  em-alta/
components/
  sidebar.tsx        # nav fixa (desktop) + Sheet (mobile), branding @tres.ag no topo
  page-header.tsx     # título + descrição + slot de ação, reusado em toda página
  stat-card.tsx       # card de métrica com delta (usado em Analytics)
  ui/                 # primitivos shadcn (button, card, badge, table, tabs, select...)
lib/
  mock-data.ts        # única fonte de dados mockados, tipada, usada por todas as páginas
  utils.ts            # cn()
```

## Tema

- Dark mode é o **padrão fixo**: `<html class="dark">` em `app/layout.tsx`. Os tokens
  `:root` (claro) continuam definidos em `globals.css` para o dia em que um toggle for
  necessário, mas não há UI de toggle hoje.
- Accent terracota: `--primary` em modo escuro é `oklch(0.68 0.15 38)` (~`#C97A4F`).
  Usado em botões primários, ícones ativos da sidebar, badges de destaque e na primeira
  linha do gráfico de Analytics.
- Paleta de gráfico (`--chart-1..5`) deriva do terracota + tons complementares (âmbar,
  azul petróleo, verde, roxo) para diferenciar séries sem sair da paleta escura.

## Dados: tudo mockado, de propósito

Este dashboard foi construído como **casca de produto** — a estrutura, o design system e
a navegação estão prontos, mas nenhuma integração externa está implementada ainda. Tudo
vem de `lib/mock-data.ts`. Isso é intencional: cada página representa uma integração
diferente, e cada uma merece sua própria decisão de arquitetura (fila de jobs, webhook,
cron, etc.) em vez de um mock genérico "fetch de API".

O que precisa ser construído para cada página virar realidade:

| Página | Hoje (mock) | Integração real necessária |
|---|---|---|
| **Hook Vault** | Lista fixa de hooks com transcrição/template escritos à mão | Endpoint que recebe URL de reel/vídeo → baixa áudio → transcreve (Whisper ou similar) → LLM extrai a linha de hook e generaliza um template. Provavelmente uma extensão de browser ou share-sheet no celular como ponto de entrada. |
| **Analytics** | Série de 7 dias e "heaters" fixos | Instagram Graph API (via conta business/creator) para views/saves/follows por post; job diário que persiste os números (a API não guarda histórico longo) e calcula os "heaters" (outliers vs. média móvel). |
| **Concorrentes** | Lista fixa de reels de 6 criadores | Worker de scraping semanal (Instagram/TikTok/YouTube não têm API pública de "reels de terceiros") rodando em cron, gravando em um banco; página só lê o snapshot mais recente. |
| **Agendador** | Botão "gerar legenda" sorteia um hook salvo | Integração com provider de publish (Meta Graph API para IG, TikTok Content Posting API, YouTube Data API) + fila de jobs para publicar no horário agendado + chamada de LLM real para gerar legenda a partir do hook/ângulo do dia. |
| **Calendário** | Entradas fixas por data | O `/script` mencionado no pedido original é presumivelmente um comando/skill que roda diariamente e grava hooks+ângulos sugeridos numa tabela `calendar_entries`; a página hoje só espelharia essa tabela. |
| **Em Alta** | 12 itens fixos, 12 fontes fixas | Agregador (RSS/API por fonte + fallback de scraping) rodando em cron, com um passo de LLM que classifica "potencial de hook" de cada notícia. |

Quando qualquer uma dessas integrações for implementada, o padrão é: manter os *types*
exportados de `lib/mock-data.ts` (`SavedHook`, `HeaterPost`, `CompetitorReel`,
`ScheduledPost`, `CalendarEntry`, `NewsItem`) como o contrato, e trocar a constante mockada
por um fetch em Server Component (ou React Query, se precisar de refetch no client) sem
precisar tocar nos componentes de página.

## Decisões de projeto

- **Sem banco/backend ainda.** Não faz sentido desenhar schema antes de saber qual
  integração entra primeiro — ver tabela acima.
- **App separado do site principal.** Este projeto vive em `creator-dashboard/` na raiz
  do repo, ao lado do site estático em `index.html` e do painel de agência em `app/`
  (Supabase). São três produtos diferentes no mesmo repositório; nenhum importa código
  do outro.
- **Componentes shadcn escritos à mão, não via CLI**, por causa do bloqueio de rede
  descrito acima — ver nota na seção "Stack".
- **pt-BR em toda a UI e nos dados mockados**, consistente com o público do painel.

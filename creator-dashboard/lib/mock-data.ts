// Mock data for UI development. Replace with real fetchers once the
// integrations described in CLAUDE.md are wired up (IG API, scraper worker,
// scheduling providers, /script pipeline, news aggregator).

export type Platform = "instagram" | "tiktok" | "youtube" | "x";

export const platformLabel: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
};

// ---------- Hook Vault ----------

export type SavedHook = {
  id: string;
  sourceCreator: string;
  sourcePlatform: Platform;
  sourceUrl: string;
  savedAt: string;
  category: string;
  rawTranscript: string;
  hookLine: string;
  template: string;
  timesUsed: number;
  performanceLift: number | null;
  tags: string[];
};

export const savedHooks: SavedHook[] = [
  {
    id: "h1",
    sourceCreator: "@growwithalex",
    sourcePlatform: "instagram",
    sourceUrl: "https://instagram.com/reel/xyz1",
    savedAt: "2026-06-28",
    category: "Contra-intuitivo",
    rawTranscript:
      "Pare de postar todo dia. Foi isso que eu fiz por 6 meses e meu alcance triplicou. Deixa eu te explicar o motivo real...",
    hookLine: "Pare de postar todo dia.",
    template: "Pare de [ação comum na sua nicho]. Foi isso que eu fiz por [período] e [resultado]. Deixa eu te explicar...",
    timesUsed: 4,
    performanceLift: 2.3,
    tags: ["contrarian", "retenção alta"],
  },
  {
    id: "h2",
    sourceCreator: "@marinacria",
    sourcePlatform: "tiktok",
    sourceUrl: "https://tiktok.com/@marinacria/video/1",
    savedAt: "2026-06-27",
    category: "Confissão",
    rawTranscript:
      "Eu menti pra vocês esse tempo todo. Não foi da noite pro dia, levei 3 anos pra chegar aqui e ninguém fala isso...",
    hookLine: "Eu menti pra vocês esse tempo todo.",
    template: "Eu [confissão relacionada ao seu processo]. Não foi da noite pro dia, levei [tempo] e ninguém fala isso.",
    timesUsed: 2,
    performanceLift: 1.6,
    tags: ["confissão", "storytelling"],
  },
  {
    id: "h3",
    sourceCreator: "@buildwithkai",
    sourcePlatform: "youtube",
    sourceUrl: "https://youtube.com/shorts/abc3",
    savedAt: "2026-06-25",
    category: "Lista",
    rawTranscript:
      "3 coisas que eu faria diferente se estivesse começando do zero hoje. Número 2 é a que mais me arrependo de não ter feito antes.",
    hookLine: "3 coisas que eu faria diferente se estivesse começando do zero hoje.",
    template: "[N] coisas que eu faria diferente se estivesse começando [contexto] hoje.",
    timesUsed: 7,
    performanceLift: 3.1,
    tags: ["lista", "evergreen"],
  },
  {
    id: "h4",
    sourceCreator: "@thecreatorlab",
    sourcePlatform: "instagram",
    sourceUrl: "https://instagram.com/reel/xyz4",
    savedAt: "2026-06-24",
    category: "Chocante",
    rawTranscript:
      "Isso vai contra tudo que te ensinaram sobre crescer nas redes. E é exatamente por isso que funciona.",
    hookLine: "Isso vai contra tudo que te ensinaram sobre crescer nas redes.",
    template: "Isso vai contra tudo que te ensinaram sobre [tema]. E é exatamente por isso que funciona.",
    timesUsed: 1,
    performanceLift: null,
    tags: ["contrarian"],
  },
  {
    id: "h5",
    sourceCreator: "@datadrivendana",
    sourcePlatform: "x",
    sourceUrl: "https://x.com/datadrivendana/status/1",
    savedAt: "2026-06-22",
    category: "Dado/Prova",
    rawTranscript:
      "Analisei 500 reels virais dos últimos 90 dias. Só 4% deles usavam trending audio. O resto era hook puro.",
    hookLine: "Analisei 500 reels virais dos últimos 90 dias.",
    template: "Analisei [N] [conteúdo] virais dos últimos [período]. Só [%] tinham [suposição comum].",
    timesUsed: 5,
    performanceLift: 2.8,
    tags: ["dado", "autoridade"],
  },
  {
    id: "h6",
    sourceCreator: "@growwithalex",
    sourcePlatform: "instagram",
    sourceUrl: "https://instagram.com/reel/xyz6",
    savedAt: "2026-06-20",
    category: "Pergunta",
    rawTranscript:
      "Você já parou pra pensar por que seus reels bombam e o próximo vídeo morre? Eu descobri o padrão.",
    hookLine: "Você já parou pra pensar por que seus reels bombam e o próximo vídeo morre?",
    template: "Você já parou pra pensar por que [comportamento inconsistente]? Eu descobri o padrão.",
    timesUsed: 3,
    performanceLift: 1.9,
    tags: ["pergunta", "curiosidade"],
  },
];

// ---------- Analytics ----------

export const igDailySeries = [
  { date: "26/06", views: 42100, saves: 1280, follows: 210 },
  { date: "27/06", views: 38900, saves: 990, follows: 175 },
  { date: "28/06", views: 61200, saves: 2140, follows: 340 },
  { date: "29/06", views: 55300, saves: 1870, follows: 298 },
  { date: "30/06", views: 88700, saves: 3420, follows: 512 },
  { date: "01/07", views: 103400, saves: 4110, follows: 640 },
  { date: "02/07", views: 76200, saves: 2650, follows: 401 },
];

export const analyticsSummary = {
  views: { value: 465800, delta: 18.4 },
  saves: { value: 16460, delta: 24.1 },
  follows: { value: 2576, delta: 12.7 },
  avgWatchTime: { value: "9.2s", delta: 6.3 },
};

export type HeaterPost = {
  id: string;
  caption: string;
  postedAt: string;
  views: number;
  saves: number;
  shares: number;
  followsGained: number;
  hookUsed: string;
  thumbnailColor: string;
};

export const weeklyHeaters: HeaterPost[] = [
  {
    id: "p1",
    caption: "3 coisas que eu faria diferente começando do zero",
    postedAt: "01/07",
    views: 412300,
    saves: 18900,
    shares: 6200,
    followsGained: 1840,
    hookUsed: "Lista",
    thumbnailColor: "bg-[oklch(0.68_0.15_38)]",
  },
  {
    id: "p2",
    caption: "Pare de postar todo dia (aqui está o motivo)",
    postedAt: "29/06",
    views: 268900,
    saves: 9700,
    shares: 3100,
    followsGained: 902,
    hookUsed: "Contra-intuitivo",
    thumbnailColor: "bg-[oklch(0.62_0.1_200)]",
  },
  {
    id: "p3",
    caption: "Analisei 500 reels virais e achei o padrão",
    postedAt: "27/06",
    views: 191400,
    saves: 7400,
    shares: 2050,
    followsGained: 611,
    hookUsed: "Dado/Prova",
    thumbnailColor: "bg-[oklch(0.72_0.12_145)]",
  },
];

// ---------- Concorrentes ----------

export type CompetitorReel = {
  id: string;
  creator: string;
  handle: string;
  platform: Platform;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  postedAt: string;
  scrapedAt: string;
};

export const trackedCreators = [
  "@growwithalex",
  "@marinacria",
  "@buildwithkai",
  "@thecreatorlab",
  "@datadrivendana",
  "@nichequeen",
];

export const competitorReels: CompetitorReel[] = [
  {
    id: "c1",
    creator: "Alex Souza",
    handle: "@growwithalex",
    platform: "instagram",
    caption: "O erro de conteúdo que 90% dos criadores cometem",
    views: 1240000,
    likes: 87400,
    comments: 2310,
    postedAt: "30/06",
    scrapedAt: "02/07 06:00",
  },
  {
    id: "c2",
    creator: "Marina Cria",
    handle: "@marinacria",
    platform: "tiktok",
    caption: "Como eu edito um reel em 12 minutos",
    views: 890200,
    likes: 65100,
    comments: 1420,
    postedAt: "29/06",
    scrapedAt: "02/07 06:00",
  },
  {
    id: "c3",
    creator: "Kai Ferreira",
    handle: "@buildwithkai",
    platform: "youtube",
    caption: "Testei 3 apps de agendamento por 30 dias",
    views: 512300,
    likes: 31200,
    comments: 980,
    postedAt: "28/06",
    scrapedAt: "02/07 06:00",
  },
  {
    id: "c4",
    creator: "The Creator Lab",
    handle: "@thecreatorlab",
    platform: "instagram",
    caption: "Isso vai contra tudo que te ensinaram sobre crescer",
    views: 445000,
    likes: 28900,
    comments: 740,
    postedAt: "27/06",
    scrapedAt: "02/07 06:00",
  },
  {
    id: "c5",
    creator: "Dana Dados",
    handle: "@datadrivendana",
    platform: "x",
    caption: "Analisei 500 reels virais dos últimos 90 dias",
    views: 298000,
    likes: 19400,
    comments: 512,
    postedAt: "26/06",
    scrapedAt: "02/07 06:00",
  },
  {
    id: "c6",
    creator: "Nicole Reis",
    handle: "@nichequeen",
    platform: "tiktok",
    caption: "3 nichos saturados que ainda dá pra entrar",
    views: 276000,
    likes: 17800,
    comments: 601,
    postedAt: "25/06",
    scrapedAt: "02/07 06:00",
  },
];

// ---------- Agendador ----------

export type ScheduledPost = {
  id: string;
  title: string;
  platforms: Platform[];
  scheduledFor: string;
  status: "rascunho" | "agendado" | "publicado" | "falhou";
  caption: string;
  hookRef: string | null;
};

export const scheduledPosts: ScheduledPost[] = [
  {
    id: "s1",
    title: "3 coisas que eu faria diferente",
    platforms: ["instagram", "tiktok", "youtube"],
    scheduledFor: "03/07 09:00",
    status: "agendado",
    caption:
      "3 coisas que eu faria diferente se estivesse começando do zero hoje 👇\n\nSalva pra não esquecer.\n\n#criadordigital #conteudo #crescimento",
    hookRef: "h3",
  },
  {
    id: "s2",
    title: "Pare de postar todo dia",
    platforms: ["instagram"],
    scheduledFor: "03/07 18:30",
    status: "agendado",
    caption:
      "Pare de postar todo dia. Foi isso que eu fiz por 6 meses e meu alcance triplicou 📈\n\nComenta ALCANCE que eu te mando o passo a passo.",
    hookRef: "h1",
  },
  {
    id: "s3",
    title: "Bastidor da produção da semana",
    platforms: ["tiktok", "x"],
    scheduledFor: "04/07 12:00",
    status: "rascunho",
    caption: "Rascunho gerado automaticamente — revisar antes de agendar.",
    hookRef: null,
  },
  {
    id: "s4",
    title: "Analisei 500 reels virais",
    platforms: ["instagram", "youtube"],
    scheduledFor: "01/07 08:00",
    status: "publicado",
    caption:
      "Analisei 500 reels virais dos últimos 90 dias. Só 4% usavam trending audio 👀",
    hookRef: "h5",
  },
];

// ---------- Calendário ----------

export type CalendarEntry = {
  date: string; // YYYY-MM-DD
  angle: string;
  hookRef: string | null;
  platform: Platform;
  status: "gerado" | "revisado" | "produzido";
};

export const calendarEntries: CalendarEntry[] = [
  { date: "2026-07-01", angle: "Bastidor: como organizo meus hooks salvos", hookRef: "h5", platform: "instagram", status: "produzido" },
  { date: "2026-07-02", angle: "Confissão sobre o que não funcionou no último lançamento", hookRef: "h2", platform: "tiktok", status: "revisado" },
  { date: "2026-07-03", angle: "Lista: 3 erros de quem tá começando agora", hookRef: "h3", platform: "instagram", status: "gerado" },
  { date: "2026-07-04", angle: "Contra-intuitivo: por que postar menos gerou mais alcance", hookRef: "h1", platform: "youtube", status: "gerado" },
  { date: "2026-07-06", angle: "Pergunta pro público: qual formato querem ver mais", hookRef: "h6", platform: "instagram", status: "gerado" },
  { date: "2026-07-08", angle: "Dado: análise dos últimos 90 dias de posts", hookRef: "h5", platform: "x", status: "gerado" },
  { date: "2026-07-09", angle: "Chocante: o hábito que quebrei pra crescer", hookRef: "h4", platform: "tiktok", status: "gerado" },
];

// ---------- Em Alta (AI news) ----------

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  hookPotential: "alto" | "médio" | "baixo";
  url: string;
};

export const aiNewsSources = [
  "TechCrunch AI",
  "The Information",
  "OpenAI Blog",
  "Anthropic News",
  "Google DeepMind",
  "Hacker News",
  "Simon Willison",
  "The Verge AI",
  "VentureBeat AI",
  "Ben's Bites",
  "Import AI",
  "Latent Space",
];

export const trendingNews: NewsItem[] = [
  {
    id: "n1",
    title: "Novo modelo bate recorde em benchmark de raciocínio",
    source: "TechCrunch AI",
    publishedAt: "02/07 07:12",
    summary: "Lançamento surpresa supera o estado da arte anterior em 14 pontos, gerando debate sobre metodologia do benchmark.",
    hookPotential: "alto",
    url: "https://techcrunch.com/ai/exemplo-1",
  },
  {
    id: "n2",
    title: "Empresa de IA levanta rodada gigante para agentes autônomos",
    source: "The Information",
    publishedAt: "02/07 05:40",
    summary: "Rodada valoriza a startup em bilhões, apostando que agentes vão substituir boa parte do trabalho de escritório.",
    hookPotential: "alto",
    url: "https://theinformation.com/exemplo-2",
  },
  {
    id: "n3",
    title: "Atualização silenciosa muda comportamento do assistente mais usado do mundo",
    source: "Hacker News",
    publishedAt: "01/07 22:15",
    summary: "Usuários notaram mudanças de tom e recusa antes de qualquer anúncio oficial — thread com 800+ comentários.",
    hookPotential: "alto",
    url: "https://news.ycombinator.com/exemplo-3",
  },
  {
    id: "n4",
    title: "Novo paper propõe forma de reduzir alucinação em 40%",
    source: "Import AI",
    publishedAt: "01/07 18:00",
    summary: "Técnica é simples de implementar mas exige reformular o pipeline de fine-tuning padrão.",
    hookPotential: "médio",
    url: "https://importai.substack.com/exemplo-4",
  },
  {
    id: "n5",
    title: "Ferramenta de geração de vídeo abre acesso público",
    source: "The Verge AI",
    publishedAt: "01/07 14:30",
    summary: "Fila de espera de meses é encerrada, e resultado já viraliza nas redes com clipes surreais.",
    hookPotential: "alto",
    url: "https://theverge.com/exemplo-5",
  },
  {
    id: "n6",
    title: "Relatório trimestral mostra queda no custo por token em todos os provedores",
    source: "VentureBeat AI",
    publishedAt: "01/07 09:20",
    summary: "Custo caiu quase 60% ano a ano, acelerando adoção em produtos que antes eram inviáveis economicamente.",
    hookPotential: "baixo",
    url: "https://venturebeat.com/exemplo-6",
  },
  {
    id: "n7",
    title: "Framework de agentes open source passa de 50k stars em uma semana",
    source: "Latent Space",
    publishedAt: "30/06 20:10",
    summary: "Adoção explosiva reacende debate sobre orquestração multi-agente versus um único modelo forte.",
    hookPotential: "médio",
    url: "https://latent.space/exemplo-7",
  },
  {
    id: "n8",
    title: "Big tech anuncia parceria para treinar modelo de fronteira",
    source: "Google DeepMind",
    publishedAt: "30/06 16:45",
    summary: "Parceria combina infraestrutura de nuvem com dados proprietários em escala inédita.",
    hookPotential: "médio",
    url: "https://deepmind.google/exemplo-8",
  },
  {
    id: "n9",
    title: "Newsletter aponta 5 casos de uso de IA que já pagam a conta em pequenas empresas",
    source: "Ben's Bites",
    publishedAt: "30/06 12:00",
    summary: "Levantamento com dados reais de ROI, direto de fundadores que testaram os fluxos.",
    hookPotential: "baixo",
    url: "https://bensbites.com/exemplo-9",
  },
  {
    id: "n10",
    title: "Ferramenta de codificação por IA agora escreve e revisa PRs sozinha",
    source: "Simon Willison",
    publishedAt: "29/06 19:30",
    summary: "Análise técnica mostra onde a automação brilha e onde ainda erra feio em codebases grandes.",
    hookPotential: "médio",
    url: "https://simonwillison.net/exemplo-10",
  },
  {
    id: "n11",
    title: "Anthropic detalha nova política de uso para agentes em produção",
    source: "Anthropic News",
    publishedAt: "29/06 11:00",
    summary: "Novas diretrizes miram transparência e limites claros para automações que agem em nome do usuário.",
    hookPotential: "baixo",
    url: "https://anthropic.com/exemplo-11",
  },
  {
    id: "n12",
    title: "OpenAI publica retrospectiva de um ano de adoção corporativa",
    source: "OpenAI Blog",
    publishedAt: "28/06 09:00",
    summary: "Dados mostram setores com maior adoção e os principais motivos de abandono de projetos-piloto.",
    hookPotential: "baixo",
    url: "https://openai.com/exemplo-12",
  },
];

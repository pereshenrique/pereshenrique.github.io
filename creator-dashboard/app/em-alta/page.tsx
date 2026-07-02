"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Flame } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { aiNewsSources, trendingNews } from "@/lib/mock-data";

const potentialStyles: Record<(typeof trendingNews)[number]["hookPotential"], string> = {
  alto: "bg-primary/20 text-primary border-primary/30",
  médio: "bg-secondary text-secondary-foreground border-transparent",
  baixo: "bg-muted text-muted-foreground border-transparent",
};

const potentialOrder = { alto: 0, médio: 1, baixo: 2 };

export default function EmAltaPage() {
  const [minPotential, setMinPotential] = useState<"todos" | "alto" | "médio">("todos");

  const filtered = useMemo(() => {
    const items = [...trendingNews].sort((a, b) => potentialOrder[a.hookPotential] - potentialOrder[b.hookPotential]);
    if (minPotential === "todos") return items;
    if (minPotential === "alto") return items.filter((n) => n.hookPotential === "alto");
    return items.filter((n) => n.hookPotential === "alto" || n.hookPotential === "médio");
  }, [minPotential]);

  return (
    <div>
      <PageHeader
        title="Em Alta"
        description={`Notícias de IA de ${aiNewsSources.length} fontes, marcadas por potencial de hook`}
        action={
          <Select value={minPotential} onValueChange={(v) => setMinPotential(v as typeof minPotential)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Potencial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os potenciais</SelectItem>
              <SelectItem value="alto">Só potencial alto</SelectItem>
              <SelectItem value="médio">Alto e médio</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {aiNewsSources.map((s) => (
          <Badge key={s} variant="outline" className="text-muted-foreground">
            {s}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((news) => (
          <Card key={news.id} className="gap-2 py-4">
            <CardContent className="flex flex-col gap-2 px-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("gap-1", potentialStyles[news.hookPotential])}>
                  <Flame className="size-3" />
                  potencial {news.hookPotential}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {news.source} · {news.publishedAt}
                </span>
              </div>
              <a
                href={news.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start justify-between gap-3"
              >
                <h3 className="text-sm font-medium leading-snug group-hover:underline">{news.title}</h3>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              </a>
              <p className="text-sm text-muted-foreground">{news.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

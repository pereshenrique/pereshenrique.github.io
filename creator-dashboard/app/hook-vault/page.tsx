"use client";

import { useMemo, useState } from "react";
import { Bookmark, Copy, ExternalLink, Repeat2, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { platformLabel, savedHooks } from "@/lib/mock-data";

const categories = ["Todas", ...Array.from(new Set(savedHooks.map((h) => h.category)))];

export default function HookVaultPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const filtered = useMemo(() => {
    return savedHooks.filter((hook) => {
      const matchesCategory = category === "Todas" || hook.category === category;
      const matchesQuery =
        query.trim() === "" ||
        hook.hookLine.toLowerCase().includes(query.toLowerCase()) ||
        hook.sourceCreator.toLowerCase().includes(query.toLowerCase()) ||
        hook.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div>
      <PageHeader
        title="Hook Vault"
        description={`${savedHooks.length} hooks salvos · transcritos e templatizados automaticamente`}
        action={
          <Button size="sm">
            <Bookmark className="size-4" />
            Salvar novo hook
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por hook, criador ou tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((hook) => (
          <Card key={hook.id} className="gap-4">
            <CardHeader className="flex-row items-start justify-between gap-3 px-5">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{hook.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {hook.sourceCreator} · {platformLabel[hook.sourcePlatform]}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug">&ldquo;{hook.hookLine}&rdquo;</p>
              </div>
              <a
                href={hook.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 px-5">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Transcrição</p>
                <p className="text-sm text-muted-foreground/90">{hook.rawTranscript}</p>
              </div>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Template</p>
                <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
                  {hook.template}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hook.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-muted-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-3 border-t px-5 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Repeat2 className="size-3.5" /> usado {hook.timesUsed}x
                </span>
                {hook.performanceLift && (
                  <span className="flex items-center gap-1 text-chart-4">
                    <TrendingUp className="size-3.5" /> +{hook.performanceLift}x média
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Copy className="size-3.5" />
                Usar template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

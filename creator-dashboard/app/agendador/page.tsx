"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Platform, platformLabel, savedHooks, scheduledPosts } from "@/lib/mock-data";

const platformOptions: Platform[] = ["instagram", "tiktok", "youtube", "x"];

const statusStyles: Record<(typeof scheduledPosts)[number]["status"], string> = {
  rascunho: "bg-muted text-muted-foreground",
  agendado: "bg-secondary text-secondary-foreground",
  publicado: "bg-chart-4/20 text-chart-4",
  falhou: "bg-destructive/20 text-destructive",
};

function GeneratedCaptionButton({ onGenerate }: { onGenerate: (caption: string) => void }) {
  const generate = () => {
    const hook = savedHooks[Math.floor(Math.random() * savedHooks.length)];
    onGenerate(
      `${hook.hookLine}\n\nSalva esse post pra não esquecer. 🔖\n\n#criadordigital #conteudo #${hook.category
        .toLowerCase()
        .replace(/[^a-z]/g, "")}`
    );
  };

  return (
    <Button type="button" variant="secondary" size="sm" onClick={generate}>
      <Sparkles className="size-3.5" />
      Gerar legenda automática
    </Button>
  );
}

export default function AgendadorPage() {
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["instagram"]);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <div>
      <PageHeader
        title="Agendador"
        description="Agendamento multi-plataforma em um clique, com legenda auto-gerada"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader className="px-5">
            <CardTitle className="text-sm font-medium">Novo agendamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título interno</Label>
              <Input id="title" placeholder="Ex: Reel bastidor da semana" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Plataformas</Label>
              <div className="grid grid-cols-2 gap-2">
                {platformOptions.map((p) => (
                  <label
                    key={p}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      selectedPlatforms.includes(p)
                        ? "border-primary/60 bg-accent"
                        : "border-input hover:bg-accent/40"
                    )}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(p)}
                      onCheckedChange={() => togglePlatform(p)}
                    />
                    {platformLabel[p]}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="datetime">Data e hora</Label>
              <Input id="datetime" type="datetime-local" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="caption">Legenda</Label>
                <GeneratedCaptionButton onGenerate={setCaption} />
              </div>
              <Textarea
                id="caption"
                rows={6}
                placeholder="Escreva ou gere automaticamente a partir de um hook salvo"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button className="mt-1">
              <Send className="size-4" />
              Agendar em {selectedPlatforms.length || 0} plataforma{selectedPlatforms.length === 1 ? "" : "s"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {scheduledPosts.map((post) => (
            <Card key={post.id} className="gap-3">
              <CardContent className="flex flex-col gap-3 px-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge className={cn("border-transparent", statusStyles[post.status])}>{post.status}</Badge>
                    {post.platforms.map((p) => (
                      <Badge key={p} variant="outline">
                        {platformLabel[p]}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground whitespace-pre-line">
                    {post.caption}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">agendado para</p>
                  <p className="text-sm font-medium">{post.scheduledFor}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

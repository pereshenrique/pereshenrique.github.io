import { RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { competitorReels, platformLabel, trackedCreators } from "@/lib/mock-data";

function formatCompact(n: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ConcorrentesPage() {
  const sorted = [...competitorReels].sort((a, b) => b.views - a.views);

  return (
    <div>
      <PageHeader
        title="Concorrentes"
        description="Top reels dos criadores que você acompanha, raspado toda semana"
        action={
          <Button size="sm" variant="outline">
            <RefreshCw className="size-3.5" />
            Raspar agora
          </Button>
        }
      />

      <Card className="mb-5 gap-3">
        <CardContent className="flex flex-wrap items-center gap-2 px-5">
          <span className="text-xs font-medium text-muted-foreground">Monitorando:</span>
          {trackedCreators.map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs">
            + adicionar criador
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criador</TableHead>
                <TableHead>Reel</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comentários</TableHead>
                <TableHead className="text-right">Postado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((reel) => (
                <TableRow key={reel.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback>{initials(reel.creator)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{reel.creator}</span>
                        <span className="text-xs text-muted-foreground">{reel.handle}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 truncate whitespace-normal text-sm">{reel.caption}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{platformLabel[reel.platform]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCompact(reel.views)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCompact(reel.likes)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCompact(reel.comments)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{reel.postedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        Última raspagem: {competitorReels[0]?.scrapedAt} · próxima execução automática em 7 dias
      </p>
    </div>
  );
}

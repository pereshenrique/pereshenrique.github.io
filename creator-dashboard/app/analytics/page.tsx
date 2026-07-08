"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsSummary, igDailySeries, weeklyHeaters } from "@/lib/mock-data";

function formatCompact(n: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Views, saves e follows do Instagram nos últimos 7 dias"
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Views" value={formatCompact(analyticsSummary.views.value)} delta={analyticsSummary.views.delta} />
        <StatCard label="Saves" value={formatCompact(analyticsSummary.saves.value)} delta={analyticsSummary.saves.delta} />
        <StatCard label="Follows" value={formatCompact(analyticsSummary.follows.value)} delta={analyticsSummary.follows.delta} />
        <StatCard label="Tempo médio assistido" value={analyticsSummary.avgWatchTime.value} delta={analyticsSummary.avgWatchTime.delta} />
      </div>

      <Card className="mb-6">
        <CardHeader className="px-5">
          <CardTitle className="text-sm font-medium">Views, saves e follows por dia</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={igDailySeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCompact(Number(v))}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value) => formatCompact(Number(value))}
                />
                <Line type="monotone" dataKey="views" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="saves" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Saves" />
                <Line type="monotone" dataKey="follows" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="Follows" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center gap-2">
        <Flame className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Heaters da semana</h2>
        <span className="text-xs text-muted-foreground">posts com performance muito acima da média</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {weeklyHeaters.map((post, i) => (
          <Card key={post.id} className="gap-3 py-0 overflow-hidden">
            <div className={`h-24 w-full ${post.thumbnailColor} flex items-end p-3`}>
              <Badge className="bg-black/30 text-white border-transparent backdrop-blur-sm">#{i + 1} da semana</Badge>
            </div>
            <CardContent className="flex flex-col gap-2 px-4 pb-4">
              <p className="text-sm font-medium leading-snug">{post.caption}</p>
              <p className="text-xs text-muted-foreground">Postado em {post.postedAt} · hook: {post.hookUsed}</p>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-semibold">{formatCompact(post.views)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saves</p>
                  <p className="font-semibold">{formatCompact(post.saves)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shares</p>
                  <p className="font-semibold">{formatCompact(post.shares)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Novos follows</p>
                  <p className="font-semibold">{formatCompact(post.followsGained)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

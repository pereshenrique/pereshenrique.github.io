import { Bot } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calendarEntries, platformLabel, savedHooks } from "@/lib/mock-data";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const statusStyles: Record<(typeof calendarEntries)[number]["status"], string> = {
  gerado: "bg-muted text-muted-foreground",
  revisado: "bg-secondary text-secondary-foreground",
  produzido: "bg-chart-4/20 text-chart-4",
};

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarioPage() {
  const year = 2026;
  const month = 6; // julho (0-indexed)
  const cells = buildMonthGrid(year, month);
  const entriesByDate = new Map(calendarEntries.map((e) => [e.date, e]));
  const hooksById = new Map(savedHooks.map((h) => [h.id, h]));
  const today = toKey(new Date(2026, 6, 2));

  return (
    <div>
      <PageHeader
        title="Calendário"
        description="Auto-preenchido pelo /script com hooks e ângulos para cada dia"
        action={
          <Badge variant="outline" className="gap-1.5">
            <Bot className="size-3.5" />
            /script rodou hoje às 05:00
          </Badge>
        }
      />

      <Card>
        <CardContent className="px-3 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Julho 2026</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-muted-foreground/50" /> gerado
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-foreground/60" /> revisado
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-chart-4" /> produzido
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
            {WEEKDAYS.map((w) => (
              <div key={w} className="bg-muted px-2 py-1.5 text-center font-medium uppercase text-muted-foreground">
                {w}
              </div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={i} className="min-h-24 bg-card/40" />;
              const key = toKey(date);
              const entry = entriesByDate.get(key);
              const hook = entry?.hookRef ? hooksById.get(entry.hookRef) : undefined;
              const isToday = key === today;

              return (
                <div key={i} className="flex min-h-24 flex-col gap-1 bg-card p-1.5 sm:p-2">
                  <span
                    className={cn(
                      "self-start text-[11px] font-medium",
                      isToday
                        ? "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {entry && (
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="line-clamp-3 text-[11px] leading-snug">{entry.angle}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          {platformLabel[entry.platform]}
                        </Badge>
                        <span className={cn("rounded px-1.5 py-0 text-[10px]", statusStyles[entry.status])}>
                          {entry.status}
                        </span>
                      </div>
                      {hook && (
                        <p className="truncate text-[10px] text-muted-foreground" title={hook.hookLine}>
                          hook: {hook.hookLine}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

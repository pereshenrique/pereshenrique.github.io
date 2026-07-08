import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                positive ? "text-chart-4" : "text-destructive"
              )}
            >
              {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Vault,
  BarChart3,
  Radar,
  CalendarClock,
  CalendarDays,
  Flame,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/hook-vault", label: "Hook Vault", icon: Vault },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/concorrentes", label: "Concorrentes", icon: Radar },
  { href: "/agendador", label: "Agendador", icon: CalendarClock },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/em-alta", label: "Em Alta", icon: Flame },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        t
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">@tres.ag</span>
        <span className="text-xs text-muted-foreground">painel de conteúdo</span>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className={cn("size-4", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Brand />
        <NavLinks />
        <div className="border-t border-sidebar-border px-3 py-3 text-xs text-muted-foreground">
          v0.1 · dados de exemplo
        </div>
      </aside>

      <div className="flex items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 py-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <Brand />
            <NavLinks />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">@tres.ag</span>
      </div>
    </>
  );
}

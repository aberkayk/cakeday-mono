"use client";

import { Cake, Gift, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials, formatBirthday } from "@/lib/utils";
import type { Employee } from "@/lib/shared";
import { differenceInDays, parseISO, setYear, isAfter } from "date-fns";
import Link from "next/link";

interface UpcomingBirthdaysProps {
  employees: Employee[];
  isLoading?: boolean;
}

function getDaysUntilBirthday(dateOfBirth: string): number {
  const today = new Date();
  const dob = parseISO(dateOfBirth);
  let nextBirthday = setYear(dob, today.getFullYear());
  if (!isAfter(nextBirthday, today)) {
    nextBirthday = setYear(dob, today.getFullYear() + 1);
  }
  return differenceInDays(nextBirthday, today);
}

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-accent/20 text-accent-foreground",
  "bg-background-secondary text-foreground",
  "bg-primary/10 text-primary",
  "bg-accent/40 text-accent-foreground",
  "bg-primary/5 text-primary",
  "bg-background-secondary/80 text-muted-foreground",
  "bg-accent text-accent-foreground",
];

export function UpcomingBirthdays({ employees, isLoading = false }: UpcomingBirthdaysProps) {
  const upcoming = employees
    .map((e) => ({ ...e, daysUntil: getDaysUntilBirthday(e.date_of_birth) }))
    .filter((e) => e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);

  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border-soft">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft/50">
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold font-headline text-foreground">Yaklaşan Doğum Günleri</h2>
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
            30 gün
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/50">
          <Link href="/dashboard/employees">
            Tümü
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="px-6 py-3">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-12 text-center">
            <Gift className="mx-auto h-12 w-12 text-surface-container-highest mb-3" />
            <p className="text-sm font-medium text-muted mb-1">Yaklaşan doğum günü yok</p>
            <p className="text-xs text-muted/70">Önümüzdeki 30 günde doğum günü bulunmuyor.</p>
          </div>
        ) : (
          <div>
            {upcoming.map((employee, idx) => {
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isToday = employee.daysUntil === 0;
              const isTomorrow = employee.daysUntil === 1;
              const isUrgent = employee.daysUntil <= 3;

              return (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 py-3 border-b border-border-soft/30 last:border-0 hover:bg-background-secondary/50 -mx-6 px-6 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`${colorClass} font-semibold text-sm`}>
                        {getInitials(`${employee.first_name} ${employee.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    {isToday && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-primary rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[7px]">
                        🎂
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {employee.department ?? "Departman yok"} · {formatBirthday(employee.date_of_birth)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-primary/20 text-primary"
                        : isTomorrow
                        ? "bg-accent text-accent-foreground"
                        : isUrgent
                        ? "bg-accent/40 text-accent-foreground"
                        : "bg-background-secondary text-muted-foreground"
                    }`}
                  >
                    {isToday ? "Bugün! 🎉" : isTomorrow ? "Yarın" : `${employee.daysUntil} gün`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

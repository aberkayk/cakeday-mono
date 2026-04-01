"use client";

import { Cake, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatBirthday } from "@/lib/utils";
import type { Employee } from "@cakeday/shared";
import { differenceInDays, parseISO, setYear, isAfter } from "date-fns";

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

export function UpcomingBirthdays({ employees, isLoading = false }: UpcomingBirthdaysProps) {
  const upcoming = employees
    .map((e) => ({ ...e, daysUntil: getDaysUntilBirthday(e.date_of_birth) }))
    .filter((e) => e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Yaklaşan Doğum Günleri
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          Sonraki 30 gün
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-8 text-center">
            <Gift className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Önümüzdeki 30 günde doğum günü yok.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((employee) => (
              <div key={employee.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(`${employee.first_name} ${employee.last_name}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employee.department ?? "—"} · {formatBirthday(employee.date_of_birth)}
                  </p>
                </div>
                <Badge
                  variant={employee.daysUntil === 0 ? "default" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {employee.daysUntil === 0
                    ? "Bugün!"
                    : employee.daysUntil === 1
                    ? "Yarın"
                    : `${employee.daysUntil} gün`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Cake, Gift, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials, formatBirthday } from "@/lib/utils";
import type { Employee } from "@cakeday/shared";
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
  "bg-coral-100 text-coral-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

export function UpcomingBirthdays({ employees, isLoading = false }: UpcomingBirthdaysProps) {
  const upcoming = employees
    .map((e) => ({ ...e, daysUntil: getDaysUntilBirthday(e.date_of_birth) }))
    .filter((e) => e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-coral-500" />
          <h2 className="text-base font-semibold text-gray-900">Yaklaşan Doğum Günleri</h2>
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-coral-50 text-coral-700">
            30 gün
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-coral-600 hover:text-coral-700 hover:bg-coral-50">
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
            <Gift className="mx-auto h-12 w-12 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-1">Yaklaşan doğum günü yok</p>
            <p className="text-xs text-gray-400">Önümüzdeki 30 günde doğum günü bulunmuyor.</p>
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
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-6 px-6 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`${colorClass} font-semibold text-sm`}>
                        {getInitials(`${employee.first_name} ${employee.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    {isToday && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-coral-500 rounded-full border-2 border-white flex items-center justify-center text-[7px]">
                        🎂
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {employee.department ?? "Departman yok"} · {formatBirthday(employee.date_of_birth)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-coral-100 text-coral-700"
                        : isTomorrow
                        ? "bg-orange-100 text-orange-700"
                        : isUrgent
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
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

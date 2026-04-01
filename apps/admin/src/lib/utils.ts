import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy", { locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy HH:mm", { locale: tr });
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  pending_approval: "Onay Bekliyor",
  confirmed: "Onaylandı",
  assigned: "Atandı",
  accepted: "Kabul Edildi",
  preparing: "Hazırlanıyor",
  out_for_delivery: "Yolda",
  delivered: "Teslim Edildi",
  cancellation_requested: "İptal İstendi",
  cancelled: "İptal Edildi",
  failed: "Başarısız",
  rejected: "Reddedildi",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  accepted: "bg-purple-100 text-purple-800",
  preparing: "bg-violet-100 text-violet-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancellation_requested: "bg-amber-100 text-amber-800",
  cancelled: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

export const COMPANY_STATUS_LABELS: Record<string, string> = {
  pending_verification: "Doğrulama Bekliyor",
  pending_approval: "Onay Bekliyor",
  active: "Aktif",
  suspended: "Askıya Alındı",
  deactivated: "Deaktif",
};

export const BAKERY_STATUS_LABELS: Record<string, string> = {
  pending_setup: "Kurulum Bekliyor",
  active: "Aktif",
  inactive: "Pasif",
  suspended: "Askıya Alındı",
};

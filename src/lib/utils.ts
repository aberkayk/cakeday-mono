import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in TRY
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date for display
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy", { locale: tr });
  } catch {
    return dateStr;
  }
}

// Format date + time
export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy HH:mm", { locale: tr });
  } catch {
    return dateStr;
  }
}

// Format birth date to "dd MMM"
export function formatBirthday(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM", { locale: tr });
  } catch {
    return dateStr;
  }
}

// Get initials from full name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Cake size labels
export const CAKE_SIZE_LABELS: Record<string, string> = {
  small: "Küçük",
  medium: "Orta",
  large: "Büyük",
};

// Order status labels & colors
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  preparing: "Hazırlanıyor",
  out_for_delivery: "Yolda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  failed: "Başarısız",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
};

// Company status labels
export const COMPANY_STATUS_LABELS: Record<string, string> = {
  pending_verification: "Doğrulama Bekliyor",
  pending_approval: "Onay Bekliyor",
  active: "Aktif",
  suspended: "Askıya Alındı",
  deactivated: "Deaktif",
};

// Bakery status labels
export const BAKERY_STATUS_LABELS: Record<string, string> = {
  pending_setup: "Kurulum Bekliyor",
  active: "Aktif",
  inactive: "Pasif",
  suspended: "Askıya Alındı",
};

// District labels
export const DISTRICT_LABELS: Record<string, string> = {
  besiktas: "Beşiktaş",
  sariyer: "Sarıyer",
};

// Company size range labels
export const COMPANY_SIZE_LABELS: Record<string, string> = {
  "1-10": "1-10 çalışan",
  "11-50": "11-50 çalışan",
  "51-200": "51-200 çalışan",
  "201-500": "201-500 çalışan",
  "500+": "500+ çalışan",
};

// Sector options
export const SECTOR_OPTIONS = [
  "Teknoloji",
  "Finans",
  "Sağlık",
  "Eğitim",
  "Perakende",
  "İmalat",
  "İnşaat",
  "Lojistik",
  "Medya",
  "Hukuk",
  "Danışmanlık",
  "Diğer",
];

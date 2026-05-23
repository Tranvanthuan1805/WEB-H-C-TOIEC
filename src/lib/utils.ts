import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string = "vi", fmt: string = "PPP") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, fmt, { locale: locale === "vi" ? vi : enUS });
}

export function formatCurrency(amount: number, currency: string = "VND") {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function getGreeting(locale: string = "vi"): string {
  const hour = new Date().getHours();
  if (locale === "vi") {
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getDayOfWeek(locale: string = "vi"): string {
  const days_vi = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  const days_en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const d = new Date().getDay();
  return locale === "vi" ? days_vi[d] : days_en[d];
}

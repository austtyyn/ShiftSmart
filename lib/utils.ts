import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatShiftTime(start: string, end: string): string {
  return `${format(new Date(start), "h:mm a")} – ${format(new Date(end), "h:mm a")}`;
}

export function generateInviteCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";
  const prefix = Array.from({ length: 2 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");
  const suffix = Array.from({ length: 4 }, () =>
    digits[Math.floor(Math.random() * digits.length)]
  ).join("");
  return `${prefix}-${suffix}`;
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "owner":
      return "bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30";
    case "manager":
      return "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30";
    default:
      return "bg-[#888]/20 text-[#888] border border-[#888]/30";
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "manager":
      return "Manager";
    default:
      return "Crew";
  }
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  HR: "hr",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

export const PRIVILEGED_ROLES = ["superadmin", "admin", "hr"] as const;
export const MANAGEMENT_ROLES = ["superadmin", "admin", "hr", "manager"] as const;

export const canAccess = (userRole: string, allowedRoles: readonly string[]) =>
  allowedRoles.includes(userRole);

export const LEAVE_TYPE_COLORS: Record<string, string> = {
  casual: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sick: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  earned: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  maternity: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  paternity: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  unpaid: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  resigned: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "on-leave": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  present: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  processed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

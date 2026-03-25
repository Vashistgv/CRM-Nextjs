"use client";
import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarOff,
  Clock,
  DollarSign,
  FileText,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import { cn, canAccess, MANAGEMENT_ROLES, PRIVILEGED_ROLES } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/lib/services";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: null,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    roles: MANAGEMENT_ROLES,
  },
  { href: "/leaves", label: "Leaves", icon: CalendarOff, roles: null },
  { href: "/attendance", label: "Attendance", icon: Clock, roles: null },
  {
    href: "/salary",
    label: "Salary",
    icon: DollarSign,
    roles: PRIVILEGED_ROLES,
  },
  {
    href: "/payroll",
    label: "Payroll",
    icon: FileText,
    roles: PRIVILEGED_ROLES,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
    document.cookie = "crm-auth-status=; Max-Age=0; path=/";
    document.cookie = "crm-user-role=; Max-Age=0; path=/";
    router.push("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && canAccess(user.role, item.roles)),
  );

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">
            CRM Portal
          </p>
          <p className="text-xs text-sidebar-foreground/50 capitalize">
            {user?.role}
          </p>
        </div>
      </div>
      {isPending && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => {
                startTransition(() => {
                  router.push(item.href);
                });
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

"use client";
import { useEffect, useState } from "react";
import {
  Users,
  CalendarOff,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/shared/StatCard";
import { useAuthStore } from "@/store/authStore";
import {
  employeeService,
  leaveService,
  attendanceService,
} from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
    presentToday: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [leavesRes] = await Promise.all([
          leaveService.getAll({ status: "pending", limit: 5 }),
        ]);
        setRecentLeaves(leavesRes.data.data || []);
        setStats((s) => ({ ...s, pendingLeaves: leavesRes.data.total }));

        if (["admin", "hr", "superadmin"].includes(user?.role || "")) {
          const [empRes] = await Promise.all([
            employeeService.getAll({ limit: 1 }),
          ]);
          setStats((s) => ({ ...s, employees: empRes.data.total }));
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [user]);

  const isPrivileged = ["admin", "hr", "superadmin"].includes(user?.role || "");

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`Good morning, ${user?.name?.split(" ")[0]} 👋`}
        subtitle={formatDate(new Date().toISOString())}
      />

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isPrivileged && (
            <StatCard
              title="Total Employees"
              value={stats.employees}
              icon={Users}
              subtitle="Active headcount"
              trend={{ value: 4, label: "this month" }}
            />
          )}
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={CalendarOff}
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={Clock}
            subtitle="Clocked in"
          />
          <StatCard
            title="Your Role"
            value={user?.role || "—"}
            icon={TrendingUp}
            subtitle="Access level"
            className="capitalize"
          />
        </div>

        {/* Recent pending leaves */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Pending Leave Requests
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Requires your attention
              </p>
            </div>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : recentLeaves.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No pending leaves 🎉
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {leave.employee?.employeeId} ·{" "}
                      {leave.employee?.designation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(leave.from)} → {formatDate(leave.to)} ·{" "}
                      {leave.totalDays}d
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={leave.leaveType} type="leaveType" />
                    <Badge value={leave.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { Clock, LogIn, LogOut, Wifi, WifiOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { attendanceService } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import type { Attendance } from "@/types";

export default function AttendancePage() {
  const { toast } = useToast();
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [clockedIn, setClockedIn] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isWFH, setIsWFH] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAll({ page, limit: 15, sort: "-date" });
      const records = res.data.data || [];
      setData(records);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
      // Check today's record
      const today = new Date().toDateString();
      const todayRecord = records.find((r) => new Date(r.date).toDateString() === today);
      setClockedIn(!!(todayRecord?.clockIn && !todayRecord?.clockOut));
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.clockIn(isWFH);
      toast({ title: "Clocked in successfully" });
      setClockedIn(true);
      fetchAttendance();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to clock in" });
    }
    setActionLoading(false);
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.clockOut();
      toast({ title: "Clocked out successfully" });
      setClockedIn(false);
      fetchAttendance();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to clock out" });
    }
    setActionLoading(false);
  };

  const todayRecord = data.find((r) => new Date(r.date).toDateString() === new Date().toDateString());

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row: Attendance) => <span className="text-xs font-medium">{formatDate(row.date)}</span>,
    },
    {
      key: "clockIn",
      label: "Clock In",
      render: (row: Attendance) => row.clockIn
        ? <span className="text-xs font-mono">{new Date(row.clockIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: "clockOut",
      label: "Clock Out",
      render: (row: Attendance) => row.clockOut
        ? <span className="text-xs font-mono">{new Date(row.clockOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: "workedHours",
      label: "Hours",
      render: (row: Attendance) => <span className="font-medium">{row.workedHours ? `${row.workedHours}h` : "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row: Attendance) => <Badge value={row.status} />,
    },
    {
      key: "flags",
      label: "Flags",
      render: (row: Attendance) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.isWFH && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">WFH</span>}
          {row.isLate && <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Late {row.lateByMinutes}m</span>}
          {row.overtimeHours > 0 && <span className="text-xs text-green-600 dark:text-green-400 font-medium">OT {row.overtimeHours}h</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Attendance" subtitle="Track your daily attendance" />

      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {/* Clock widget */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Today's Attendance</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {todayRecord?.clockIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  Clocked in at {new Date(todayRecord.clockIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {todayRecord.clockOut && ` · Out at ${new Date(todayRecord.clockOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWFH(!isWFH)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${isWFH ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                {isWFH ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                WFH
              </button>
              {!clockedIn ? (
                <Button size="sm" onClick={handleClockIn} disabled={actionLoading} className="gap-1.5">
                  <LogIn className="h-4 w-4" /> Clock In
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleClockOut} disabled={actionLoading} className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400">
                  <LogOut className="h-4 w-4" /> Clock Out
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Present", value: data.filter((r) => r.status === "present").length, color: "text-green-600" },
            { label: "Absent", value: data.filter((r) => r.status === "absent").length, color: "text-red-600" },
            { label: "WFH Days", value: data.filter((r) => r.isWFH).length, color: "text-blue-600" },
            { label: "Late Arrivals", value: data.filter((r) => r.isLate).length, color: "text-yellow-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <DataTable columns={columns} data={data} loading={loading} page={page}
          pages={pages} total={total} onPageChange={setPage} emptyMessage="No attendance records" />
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { leaveService } from "@/lib/services";
import { useAuthStore } from "@/store/authStore";
import { canAccess, MANAGEMENT_ROLES, formatDate } from "@/lib/utils";
import type { Leave } from "@/types";

export default function LeavesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [data, setData] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({ leaveType: "casual", from: "", to: "", reason: "" });

  const isManager = canAccess(user?.role || "", MANAGEMENT_ROLES);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await leaveService.getAll(params);
      setData(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApply = async () => {
    if (!form.from || !form.to || !form.reason) return;
    try {
      await leaveService.apply(form);
      toast({ title: "Leave applied successfully" });
      setApplyOpen(false);
      fetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to apply" });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveService.approve(id);
      toast({ title: "Leave approved" });
      fetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveService.reject(id, "Rejected by manager");
      toast({ title: "Leave rejected" });
      fetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed" });
    }
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row: Leave) => (
        <div>
          <p className="font-medium text-sm">{row.employee?.employeeId}</p>
          <p className="text-xs text-muted-foreground">{row.employee?.designation}</p>
        </div>
      ),
    },
    {
      key: "leaveType",
      label: "Type",
      render: (row: Leave) => <Badge value={row.leaveType} type="leaveType" />,
    },
    {
      key: "from",
      label: "From",
      render: (row: Leave) => <span className="text-xs">{formatDate(row.from)}</span>,
    },
    {
      key: "to",
      label: "To",
      render: (row: Leave) => <span className="text-xs">{formatDate(row.to)}</span>,
    },
    {
      key: "totalDays",
      label: "Days",
      render: (row: Leave) => <span className="font-medium">{row.totalDays}</span>,
    },
    {
      key: "reason",
      label: "Reason",
      render: (row: Leave) => (
        <span className="text-xs text-muted-foreground truncate max-w-[160px] block">{row.reason}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Leave) => <Badge value={row.status} />,
    },
    ...(isManager ? [{
      key: "actions",
      label: "Actions",
      render: (row: Leave) =>
        row.status === "pending" ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleApprove(row._id)}>
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleReject(row._id)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : null,
    }] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Leaves" subtitle="Manage leave requests" />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="ml-auto gap-1.5" onClick={() => setApplyOpen(true)}>
            <Plus className="h-4 w-4" /> Apply Leave
          </Button>
        </div>

        <DataTable columns={columns} data={data} loading={loading} page={page}
          pages={pages} total={total} onPageChange={setPage} emptyMessage="No leave requests" />
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Leave Type</Label>
              <Select value={form.leaveType} onValueChange={(v) => setForm({ ...form, leaveType: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["casual","sick","earned","maternity","paternity","unpaid"].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input type="date" className="mt-1.5" value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </div>
              <div>
                <Label>To</Label>
                <Input type="date" className="mt-1.5" value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea className="mt-1.5" rows={3} placeholder="Brief reason…"
                value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { Play, CheckCircle, Loader2, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { payrollService, employeeService } from "@/lib/services";
import { formatCurrency, MONTH_NAMES } from "@/lib/utils";
import type { Payroll, EmployeeProfile } from "@/types";

export default function PayrollPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [genOpen, setGenOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [genForm, setGenForm] = useState({
    employee: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });
  const [generating, setGenerating] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (yearFilter) params.year = yearFilter;
      const res = await payrollService.getAll(params);
      setData(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, statusFilter, yearFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    employeeService.getAll({ limit: 100 }).then((r) => setEmployees(r.data.data || []));
  }, []);

  const handleGenerate = async () => {
    if (!genForm.employee) return;
    setGenerating(true);
    try {
      await payrollService.generate({
        employee: genForm.employee,
        month: Number(genForm.month),
        year: Number(genForm.year),
      });
      toast({ title: "Payroll generated successfully" });
      setGenOpen(false);
      fetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to generate" });
    }
    setGenerating(false);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await payrollService.markPaid(id);
      toast({ title: "Marked as paid" });
      fetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed" });
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row: Payroll) => (
        <div>
          <p className="font-medium text-sm">{row.employee?.employeeId}</p>
          <p className="text-xs text-muted-foreground">{row.employee?.designation}</p>
        </div>
      ),
    },
    {
      key: "period",
      label: "Period",
      render: (row: Payroll) => (
        <span className="text-sm font-medium">{MONTH_NAMES[row.month - 1]} {row.year}</span>
      ),
    },
    {
      key: "grossSalary",
      label: "Gross",
      render: (row: Payroll) => <span className="text-sm">{formatCurrency(row.grossSalary)}</span>,
    },
    {
      key: "totalDeductions",
      label: "Deductions",
      render: (row: Payroll) => <span className="text-sm text-red-600 dark:text-red-400">-{formatCurrency(row.totalDeductions)}</span>,
    },
    {
      key: "netSalary",
      label: "Net Pay",
      render: (row: Payroll) => <span className="text-sm font-bold text-primary">{formatCurrency(row.netSalary)}</span>,
    },
    {
      key: "presentDays",
      label: "Days",
      render: (row: Payroll) => (
        <span className="text-xs text-muted-foreground">{row.presentDays}/{row.workingDays}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Payroll) => <Badge value={row.status} />,
    },
    {
      key: "actions",
      label: "",
      render: (row: Payroll) =>
        row.status === "processed" ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-green-600 hover:text-green-700"
            onClick={() => handleMarkPaid(row._id)}>
            <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Payroll" subtitle="Monthly payslip management" />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(1); }}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" className="ml-auto gap-1.5" onClick={() => setGenOpen(true)}>
            <Play className="h-4 w-4" /> Generate Payroll
          </Button>
        </div>

        <DataTable columns={columns} data={data} loading={loading} page={page}
          pages={pages} total={total} onPageChange={setPage} emptyMessage="No payroll records" />
      </div>

      {/* Generate dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Employee</Label>
              <Select value={genForm.employee} onValueChange={(v) => setGenForm({ ...genForm, employee: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.employeeId} — {e.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <Select value={genForm.month} onValueChange={(v) => setGenForm({ ...genForm, month: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select value={genForm.year} onValueChange={(v) => setGenForm({ ...genForm, year: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating || !genForm.employee}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

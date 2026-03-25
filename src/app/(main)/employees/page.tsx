"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeService } from "@/lib/services";
import { useAuthStore } from "@/store/authStore";
import { canAccess, PRIVILEGED_ROLES, formatDate } from "@/lib/utils";
import type { EmployeeProfile } from "@/types";

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.designation = search;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;

      const res = await employeeService.getAll(params);
      setData(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter, deptFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const isPrivileged = canAccess(user?.role || "", PRIVILEGED_ROLES);

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      render: (row: EmployeeProfile) => (
        <Link href={`/employees/${row._id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
          {row.employeeId}
        </Link>
      ),
    },
    {
      key: "user",
      label: "Name",
      render: (row: EmployeeProfile) => (
        <div>
          <p className="font-medium text-foreground">{row.user?.name}</p>
          <p className="text-xs text-muted-foreground">{row.user?.email}</p>
        </div>
      ),
    },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    {
      key: "employmentType",
      label: "Type",
      render: (row: EmployeeProfile) => (
        <span className="capitalize text-muted-foreground text-xs">{row.employmentType}</span>
      ),
    },
    {
      key: "joinDate",
      label: "Joined",
      render: (row: EmployeeProfile) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.joinDate)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: EmployeeProfile) => <Badge value={row.status} />,
    },
    {
      key: "actions",
      label: "",
      render: (row: EmployeeProfile) => (
        <Link href={`/employees/${row._id}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Employees" subtitle={`${total} total employees`} />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by designation…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter department…"
            className="w-44"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          />

          {isPrivileged && (
            <Link href="/employees/new" className="ml-auto">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </Link>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          page={page}
          pages={pages}
          total={total}
          onPageChange={setPage}
          emptyMessage="No employees found"
        />
      </div>
    </div>
  );
}

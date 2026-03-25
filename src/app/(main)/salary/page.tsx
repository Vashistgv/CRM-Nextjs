"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Edit2, Loader2, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { salaryService, employeeService } from "@/lib/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Salary, EmployeeProfile } from "@/types";

const schema = z.object({
  basicSalary: z.coerce.number().min(1),
  hra: z.coerce.number().min(0),
  travelAllowance: z.coerce.number().min(0),
  medicalAllowance: z.coerce.number().min(0),
  specialAllowance: z.coerce.number().min(0),
  providentFund: z.coerce.number().min(0),
  professionalTax: z.coerce.number().min(0),
  incomeTax: z.coerce.number().min(0),
  effectiveFrom: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function SalaryPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EmployeeProfile | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    employeeService
      .getAll({ limit: 50 })
      .then((r) => setEmployees(r.data.data || []));
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId?.toLowerCase().includes(search.toLowerCase()),
  );

  const loadSalary = async (emp: EmployeeProfile) => {
    setSelected(emp);
    setLoading(true);
    try {
      const res = await salaryService.getByEmployee(emp._id);
      setSalary(res.data.data);
    } catch {
      setSalary(null);
    }
    setLoading(false);
  };

  const openModal = (newRecord = false) => {
    setIsNew(newRecord);
    reset(
      salary
        ? {
            basicSalary: salary.basicSalary,
            hra: salary.hra,
            travelAllowance: salary.travelAllowance,
            medicalAllowance: salary.medicalAllowance,
            specialAllowance: salary.specialAllowance,
            providentFund: salary.providentFund,
            professionalTax: salary.professionalTax,
            incomeTax: salary.incomeTax,
            effectiveFrom: salary.effectiveFrom?.slice(0, 10),
          }
        : { effectiveFrom: new Date().toISOString().slice(0, 10) },
    );
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!selected) return;
    try {
      if (isNew) {
        await salaryService.create({ ...data, employee: selected._id as any });
      } else {
        await salaryService.update(selected._id, data);
      }
      toast({ title: `Salary ${isNew ? "created" : "updated"} successfully` });
      setModalOpen(false);
      await loadSalary(selected);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.response?.data?.message || "Failed",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Salary" subtitle="Manage employee salary structures" />

      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
          {/* Employee list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employee…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {filtered.map((emp) => (
                <button
                  key={emp._id}
                  onClick={() => loadSalary(emp)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors ${selected?._id === emp._id ? "bg-primary/5 border-r-2 border-primary" : ""}`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {emp.user?.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {emp.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emp.employeeId} · {emp.department}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Salary detail */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select an employee to view salary
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !salary ? (
              <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No salary structure found for {selected.user?.name}
                  </p>
                  <Button size="sm" onClick={() => openModal(true)}>
                    Create Salary Structure
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {selected.user?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Effective from {formatDate(salary.effectiveFrom)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openModal(false)}
                    className="gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Earnings */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Earnings
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Basic Salary", value: salary.basicSalary },
                        { label: "HRA", value: salary.hra },
                        {
                          label: "Travel Allowance",
                          value: salary.travelAllowance,
                        },
                        {
                          label: "Medical Allowance",
                          value: salary.medicalAllowance,
                        },
                        {
                          label: "Special Allowance",
                          value: salary.specialAllowance,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                        <span>Gross Salary</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(salary.grossSalary)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions + Net */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Deductions
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          label: "Provident Fund",
                          value: salary.providentFund,
                        },
                        {
                          label: "Professional Tax",
                          value: salary.professionalTax,
                        },
                        { label: "Income Tax (TDS)", value: salary.incomeTax },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                        <span>Total Deductions</span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(salary.totalDeductions)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-4 flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">
                        Net Salary
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(salary.netSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Create" : "Edit"} Salary Structure
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <Label>Effective From</Label>
              <Input
                type="date"
                {...register("effectiveFrom")}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "basicSalary", label: "Basic Salary" },
                { name: "hra", label: "HRA" },
                { name: "travelAllowance", label: "Travel Allowance" },
                { name: "medicalAllowance", label: "Medical Allowance" },
                { name: "specialAllowance", label: "Special Allowance" },
                { name: "providentFund", label: "Provident Fund" },
                { name: "professionalTax", label: "Professional Tax" },
                { name: "incomeTax", label: "Income Tax" },
              ].map((field) => (
                <div key={field.name}>
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    type="number"
                    {...register(field.name as keyof FormData)}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isNew ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

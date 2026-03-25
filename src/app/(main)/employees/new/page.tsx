"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { employeeService, authService } from "@/lib/services";
import api from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["employee", "manager", "hr", "admin"]),
  employeeId: z.string().min(2),
  department: z.string().min(2),
  designation: z.string().min(2),
  joinDate: z.string().min(1, "Required"),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "employee", employmentType: "full-time" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Step 1: register user
      const userRes = await api.post("/auth/register", {
        name: data.name, email: data.email, password: data.password, role: data.role,
      });
      const userId = userRes.data.user?.id;

      // Step 2: create employee profile
      await employeeService.create({
        userId,
        employeeId: data.employeeId,
        department: data.department,
        designation: data.designation,
        joinDate: data.joinDate,
        employmentType: data.employmentType,
        phone: data.phone,
      });

      toast({ title: "Employee created successfully" });
      router.push("/employees");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to create employee",
        description: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const FieldError = ({ name }: { name: keyof FormData }) =>
    errors[name] ? <p className="text-xs text-destructive mt-1">{errors[name]?.message as string}</p> : null;

  return (
    <div className="flex flex-col h-full">
      <Header title="Add Employee" subtitle="Create a new employee account and profile" />

      <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-5 gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
          {/* Account */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input {...register("name")} placeholder="John Doe" className="mt-1.5" />
                <FieldError name="name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register("email")} type="email" placeholder="john@company.com" className="mt-1.5" />
                <FieldError name="email" />
              </div>
              <div>
                <Label>Password</Label>
                <Input {...register("password")} type="password" placeholder="Min 6 chars" className="mt-1.5" />
                <FieldError name="password" />
              </div>
              <div>
                <Label>Role</Label>
                <Select defaultValue="employee" onValueChange={(v) => setValue("role", v as any)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Employee ID</Label>
                <Input {...register("employeeId")} placeholder="EMP001" className="mt-1.5 uppercase" />
                <FieldError name="employeeId" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input {...register("phone")} placeholder="9876543210" className="mt-1.5" />
              </div>
              <div>
                <Label>Department</Label>
                <Input {...register("department")} placeholder="Engineering" className="mt-1.5" />
                <FieldError name="department" />
              </div>
              <div>
                <Label>Designation</Label>
                <Input {...register("designation")} placeholder="Software Engineer" className="mt-1.5" />
                <FieldError name="designation" />
              </div>
              <div>
                <Label>Join Date</Label>
                <Input {...register("joinDate")} type="date" className="mt-1.5" />
                <FieldError name="joinDate" />
              </div>
              <div>
                <Label>Employment Type</Label>
                <Select defaultValue="full-time" onValueChange={(v) => setValue("employmentType", v as any)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Employee
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { employeeService } from "@/lib/services";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { EmployeeProfile } from "@/types";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getById(id).then((r) => {
      setEmployee(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (!employee) return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-muted-foreground">Employee not found</p>
      <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Employee Profile" subtitle={employee.employeeId} />

      <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-5 gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Hero */}
        <div className="rounded-xl border border-border bg-card p-5 mb-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {employee.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-foreground">{employee.user?.name}</h2>
                <Badge value={employee.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{employee.designation} · {employee.department}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />{employee.user?.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />{employee.phone}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
              {employee.employeeId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Employment" icon={Building2}>
            <InfoRow label="Department" value={employee.department} />
            <InfoRow label="Designation" value={employee.designation} />
            <InfoRow label="Employment Type" value={employee.employmentType} />
            <InfoRow label="Join Date" value={formatDate(employee.joinDate)} />
            <InfoRow label="Years of Service" value={`${employee.yearsOfService} years`} />
            {employee.probationEndDate && <InfoRow label="Probation End" value={formatDate(employee.probationEndDate)} />}
            {employee.exitDate && <InfoRow label="Exit Date" value={formatDate(employee.exitDate)} />}
          </Section>

          <Section title="Personal" icon={Calendar}>
            {employee.gender && <InfoRow label="Gender" value={employee.gender} />}
            {employee.dateOfBirth && <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />}
            {employee.panNumber && <InfoRow label="PAN Number" value={employee.panNumber} />}
            {employee.pfNumber && <InfoRow label="PF Number" value={employee.pfNumber} />}
          </Section>

          {employee.presentAddress?.city && (
            <Section title="Address" icon={MapPin}>
              <InfoRow label="Street" value={employee.presentAddress.street} />
              <InfoRow label="City" value={employee.presentAddress.city} />
              <InfoRow label="State" value={employee.presentAddress.state} />
              <InfoRow label="Postal Code" value={employee.presentAddress.postalCode} />
              <InfoRow label="Country" value={employee.presentAddress.country} />
            </Section>
          )}

          {employee.bankDetails?.bankName && (
            <Section title="Bank Details" icon={CreditCard}>
              <InfoRow label="Bank" value={employee.bankDetails.bankName} />
              <InfoRow label="Account Holder" value={employee.bankDetails.accountHolderName} />
              <InfoRow label="Account Type" value={employee.bankDetails.accountType} />
              <InfoRow label="IFSC Code" value={employee.bankDetails.ifscCode} />
            </Section>
          )}

          {employee.emergencyContacts && employee.emergencyContacts.length > 0 && (
            <Section title="Emergency Contacts" icon={AlertTriangle}>
              {employee.emergencyContacts.map((c, i) => (
                <div key={i} className="py-2.5 border-b border-border/50 last:border-0">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relationship} · {c.phone}</p>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

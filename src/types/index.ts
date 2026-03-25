// ── Auth ──────────────────────────────────────────────────────────
export type Role = "superadmin" | "admin" | "hr" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ── Employee ──────────────────────────────────────────────────────
export type EmploymentType = "full-time" | "part-time" | "contract" | "intern";
export type EmployeeStatus = "active" | "on-leave" | "resigned" | "terminated";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  accountType?: "savings" | "current";
}

export interface EmployeeProfile {
  _id: string;
  user: User;
  employeeId: string;
  department: string;
  designation: string;
  reportingManager?: EmployeeProfile | null;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  presentAddress?: Address;
  employmentType: EmploymentType;
  joinDate: string;
  probationEndDate?: string;
  exitDate?: string;
  status: EmployeeStatus;
  bankDetails?: BankDetails;
  panNumber?: string;
  pfNumber?: string;
  emergencyContacts?: EmergencyContact[];
  yearsOfService?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Leave ─────────────────────────────────────────────────────────
export type LeaveType = "casual" | "sick" | "earned" | "maternity" | "paternity" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Leave {
  _id: string;
  employee: Pick<EmployeeProfile, "_id" | "employeeId" | "designation">;
  leaveType: LeaveType;
  from: string;
  to: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: "morning" | "afternoon";
  reason: string;
  status: LeaveStatus;
  approvedBy?: Pick<EmployeeProfile, "_id" | "employeeId" | "designation">;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveBalance {
  _id: string;
  employee: string;
  year: number;
  balances: {
    leaveType: LeaveType;
    allocated: number;
    used: number;
    remaining: number;
  }[];
}

// ── Attendance ────────────────────────────────────────────────────
export type AttendanceStatus = "present" | "absent" | "half-day" | "on-leave" | "holiday" | "weekend";

export interface Attendance {
  _id: string;
  employee: Pick<EmployeeProfile, "_id" | "employeeId" | "designation">;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workedHours: number;
  status: AttendanceStatus;
  isWFH: boolean;
  isLate: boolean;
  lateByMinutes: number;
  isEarlyExit: boolean;
  overtimeHours: number;
  remarks?: string;
}

// ── Salary ────────────────────────────────────────────────────────
export interface Salary {
  _id: string;
  employee: Pick<EmployeeProfile, "_id" | "employeeId" | "designation">;
  effectiveFrom: string;
  basicSalary: number;
  hra: number;
  travelAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  currency: string;
  paymentMode: string;
}

// ── Payroll ───────────────────────────────────────────────────────
export type PayrollStatus = "draft" | "processed" | "paid";

export interface Payroll {
  _id: string;
  employee: Pick<EmployeeProfile, "_id" | "employeeId" | "designation">;
  month: number;
  year: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  lopDays: number;
  lopDeduction: number;
  overtimePay: number;
  presentDays: number;
  workingDays: number;
  status: PayrollStatus;
  paidAt?: string;
  createdAt: string;
}

// ── API ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

import api from "./api";
import type {
  User,
  EmployeeProfile,
  Leave,
  LeaveBalance,
  Attendance,
  Salary,
  Payroll,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post<{
      success: boolean;
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/login", { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

// ── Employees ─────────────────────────────────────────────────────
export const employeeService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<EmployeeProfile>>("/employees", { params }),
  getMe: () => api.get<ApiResponse<EmployeeProfile>>("/employees/me"),
  getById: (id: string) =>
    api.get<ApiResponse<EmployeeProfile>>(`/employees/${id}`),
  create: (data: Partial<EmployeeProfile> & { userId: string }) =>
    api.post<ApiResponse<EmployeeProfile>>("/employees", data),
  update: (id: string, data: Partial<EmployeeProfile>) =>
    api.put<ApiResponse<EmployeeProfile>>(`/employees/${id}`, data),
  remove: (id: string) => api.delete(`/employees/${id}`),
};

// ── Leaves ────────────────────────────────────────────────────────
export const leaveService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Leave>>("/leaves", { params }),
  apply: (data: {
    leaveType: string;
    from: string;
    to: string;
    reason: string;
    isHalfDay?: boolean;
  }) => api.post<ApiResponse<Leave>>("/leaves", data),
  approve: (id: string) => api.patch(`/leaves/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.patch(`/leaves/${id}/reject`, { reason }),
  cancel: (id: string) => api.patch(`/leaves/${id}/cancel`),
};

// ── Leave Balance ─────────────────────────────────────────────────
export const leaveBalanceService = {
  getByEmployee: (employeeId: string, year?: number) =>
    api.get<ApiResponse<LeaveBalance>>(`/leave-balance/${employeeId}`, {
      params: { year },
    }),
  create: (data: { employee: string; year: number }) =>
    api.post<ApiResponse<LeaveBalance>>("/leave-balance", data),
  update: (
    employeeId: string,
    data: { leaveType: string; allocated: number },
    year?: number,
  ) => api.put(`/leave-balance/${employeeId}`, data, { params: { year } }),
};

// ── Attendance ────────────────────────────────────────────────────
export const attendanceService = {
  clockIn: (isWFH = false) =>
    api.post<ApiResponse<Attendance>>("/attendance/clock-in", { isWFH }),
  clockOut: () => api.post<ApiResponse<Attendance>>("/attendance/clock-out"),
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Attendance>>("/attendance", { params }),
  getSummary: (employeeId: string, month: number, year: number) =>
    api.get(`/attendance/summary/${employeeId}`, { params: { month, year } }),
};

// ── Salary ────────────────────────────────────────────────────────
export const salaryService = {
  getByEmployee: (employeeId: string) =>
    api.get<ApiResponse<Salary>>(`/salary/${employeeId}`),
  create: (data: Partial<Salary> & { employee: string }) =>
    api.post<ApiResponse<Salary>>("/salary", data),
  update: (employeeId: string, data: Partial<Salary>) =>
    api.put<ApiResponse<Salary>>(`/salary/${employeeId}`, data),
};

// ── Payroll ───────────────────────────────────────────────────────
export const payrollService = {
  generate: (data: { employee: string; month: number; year: number }) =>
    api.post<ApiResponse<Payroll>>("/payroll/generate", data),
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Payroll>>("/payroll", { params }),
  markPaid: (id: string) => api.patch(`/payroll/${id}/mark-paid`),
};

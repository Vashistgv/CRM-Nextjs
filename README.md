# CRM Frontend — Next.js 14 + Tailwind + Shadcn UI

Production-grade employee management frontend with role-based access, multi-theme support, and JWT auth.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn UI**
- **Zustand** (state management)
- **Axios** (API client with auto JWT refresh)
- **React Hook Form** + **Zod** (forms & validation)
- **next-themes** (dark/light mode)

---

## Setup

```bash
cd crm-frontend
npm install

cp .env.local.example .env.local
# Edit .env.local → set NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx          ← Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + main wrapper
│   │   ├── dashboard/page.tsx      ← Overview + stats
│   │   ├── employees/
│   │   │   ├── page.tsx            ← Employee list + filters
│   │   │   ├── new/page.tsx        ← Create employee (HR/admin)
│   │   │   └── [id]/page.tsx       ← Employee profile detail
│   │   ├── leaves/page.tsx         ← Leave requests + apply/approve
│   │   ├── attendance/page.tsx     ← Clock-in/out + history
│   │   ├── salary/page.tsx         ← Salary structures (HR/admin)
│   │   └── payroll/page.tsx        ← Monthly payslips (HR/admin)
│   ├── layout.tsx                  ← Root layout + ThemeProvider
│   └── page.tsx                    ← Redirects to /dashboard
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             ← Navigation sidebar
│   │   ├── Header.tsx              ← Top bar + theme toggles
│   │   └── ThemeProvider.tsx       ← next-themes wrapper
│   ├── shared/
│   │   ├── StatCard.tsx
│   │   ├── Badge.tsx
│   │   └── DataTable.tsx           ← Reusable paginated table
│   └── ui/                         ← Shadcn UI primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── textarea.tsx
│       ├── dropdown-menu.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── api.ts                      ← Axios instance + JWT interceptors
│   ├── services.ts                 ← All API service calls
│   └── utils.ts                    ← cn(), formatters, role helpers
├── store/
│   ├── authStore.ts                ← Zustand auth (persisted)
│   └── themeStore.ts               ← Zustand color theme (persisted)
├── styles/
│   └── globals.css                 ← Tailwind + CSS variables (all themes)
├── types/
│   └── index.ts                    ← All TypeScript interfaces
└── middleware.ts                   ← Next.js RBAC route protection
```

---

## Themes

Toggle between **Light / Dark** and **Blue / Green** using the icons in the top header.

CSS variables are defined in `globals.css` under:
- `:root` → Light Blue (default)
- `.dark` → Dark Blue
- `[data-theme="green"]` → Green
- `[data-theme="green"].dark` → Dark Green

To add more color themes, add a new block in `globals.css` and a new entry in `Header.tsx`.

---

## RBAC

| Role       | Employees | Leaves | Attendance | Salary | Payroll |
|------------|-----------|--------|------------|--------|---------|
| superadmin | Full      | Full   | Full       | Full   | Full    |
| admin      | Full      | Full   | Full       | Full   | Full    |
| hr         | Full      | Full   | Full       | Full   | Full    |
| manager    | View      | Approve| View       | ✗      | ✗       |
| employee   | Own only  | Own    | Own        | ✗      | ✗       |

Route-level protection is in `src/middleware.ts`.  
Component-level hiding uses `canAccess()` from `lib/utils.ts`.

---

## Auth Flow

1. `POST /api/auth/login` → stores `accessToken` + `refreshToken` in `localStorage` + Zustand
2. Cookies `crm-auth-status` and `crm-user-role` are set for Next.js middleware
3. Axios interceptor auto-refreshes the access token on 401 using the refresh token
4. On logout, tokens are cleared and cookies are removed

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

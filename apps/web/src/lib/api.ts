// ============================================================
// API Client — fetch wrapper with auth headers
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  // Build query string
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }

  // Get auth token from localStorage (set by Supabase auth)
  let authHeader: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(customHeaders as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({
      error: { message: "Sunucu hatası. Lütfen tekrar deneyin." },
    }));
    throw new ApiError(
      res.status,
      errorData?.error?.code ?? "UNKNOWN_ERROR",
      errorData?.error?.message ?? "Bir hata oluştu.",
      errorData?.error?.details
    );
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...options }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PUT", body, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...options }),
};

// ---- Typed API methods ----

import type {
  ApiResponse,
  ApiListResponse,
  Employee,
  Order,
  OrderingRule,
  CakeType,
  Company,
  SubscriptionPlan,
  Invoice,
  PricingRequest,
} from "@cakeday/shared";

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: { id: string; email: string; role: string }; accessToken: string; refreshToken: string }>>("/auth/login", { email, password }),

  register: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ message: string }>>("/auth/register", data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email }),

  verifyEmail: (token: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/verify-email", { token }),

  logout: () =>
    api.post<ApiResponse<{ message: string }>>("/auth/logout"),
};

// Employees
export const employeesApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Employee>>("/employees", { params }),

  get: (id: string) =>
    api.get<ApiResponse<Employee>>(`/employees/${id}`),

  create: (data: unknown) =>
    api.post<ApiResponse<Employee>>("/employees", data),

  update: (id: string, data: unknown) =>
    api.patch<ApiResponse<Employee>>(`/employees/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/employees/${id}`),

  importCsv: (formData: FormData) =>
    request<ApiResponse<{ imported: number; skipped: number; errors: string[] }>>("/employees/import", {
      method: "POST",
      body: undefined,
      headers: {},
    }),
};

// Orders
export const ordersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Order>>("/orders", { params }),

  get: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),

  create: (data: unknown) =>
    api.post<ApiResponse<Order>>("/orders", data),

  cancel: (id: string) =>
    api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`),
};

// Ordering Rules
export const rulesApi = {
  list: () =>
    api.get<ApiListResponse<OrderingRule>>("/ordering-rules"),

  create: (data: unknown) =>
    api.post<ApiResponse<OrderingRule>>("/ordering-rules", data),

  update: (id: string, data: unknown) =>
    api.patch<ApiResponse<OrderingRule>>(`/ordering-rules/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/ordering-rules/${id}`),
};

// Cake Catalogue
export const catalogueApi = {
  list: () =>
    api.get<ApiListResponse<CakeType>>("/catalogue"),
};

// Company
export const companyApi = {
  get: () =>
    api.get<ApiResponse<Company>>("/companies/me"),

  update: (data: unknown) =>
    api.patch<ApiResponse<Company>>("/companies/me", data),
};

// Billing
export const billingApi = {
  invoices: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Invoice>>("/billing/invoices", { params }),

  plans: () =>
    api.get<ApiListResponse<SubscriptionPlan>>("/billing/plans"),
};

// Bakery
export const bakeryApi = {
  orders: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Order>>("/bakery/orders", { params }),

  acceptOrder: (id: string) =>
    api.patch<ApiResponse<Order>>(`/bakery/orders/${id}/accept`),

  rejectOrder: (id: string, reason: string) =>
    api.patch<ApiResponse<Order>>(`/bakery/orders/${id}/reject`, { reason }),

  markDelivered: (id: string) =>
    api.patch<ApiResponse<Order>>(`/bakery/orders/${id}/delivered`),

  pricingRequests: () =>
    api.get<ApiListResponse<PricingRequest>>("/bakery/pricing-requests"),

  createPricingRequest: (data: unknown) =>
    api.post<ApiResponse<PricingRequest>>("/bakery/pricing-requests", data),
};

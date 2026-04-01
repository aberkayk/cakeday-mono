const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }

  let authHeader: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) authHeader = { Authorization: `Bearer ${token}` };
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
    const errorData = await res.json().catch(() => ({ error: { message: "Sunucu hatası." } }));
    throw new Error(errorData?.error?.message ?? "Bir hata oluştu.");
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...options }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...options }),
};

import type { ApiResponse, ApiListResponse, Company, Bakery, Order, CakeType } from "@cakeday/shared";

export const adminApi = {
  // Stats
  stats: () =>
    api.get<ApiResponse<{ totalCompanies: number; totalBakeries: number; totalOrders: number; totalRevenueTry: number }>>("/admin/stats"),

  // Companies
  companies: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Company>>("/admin/companies", { params }),

  company: (id: string) =>
    api.get<ApiResponse<Company>>(`/admin/companies/${id}`),

  updateCompany: (id: string, data: unknown) =>
    api.patch<ApiResponse<Company>>(`/admin/companies/${id}`, data),

  suspendCompany: (id: string) =>
    api.patch<ApiResponse<Company>>(`/admin/companies/${id}/suspend`),

  // Bakeries
  bakeries: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Bakery>>("/admin/bakeries", { params }),

  bakery: (id: string) =>
    api.get<ApiResponse<Bakery>>(`/admin/bakeries/${id}`),

  updateBakery: (id: string, data: unknown) =>
    api.patch<ApiResponse<Bakery>>(`/admin/bakeries/${id}`, data),

  // Orders
  orders: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Order>>("/admin/orders", { params }),

  // Catalogue
  catalogue: () =>
    api.get<ApiListResponse<CakeType>>("/catalogue"),

  createCakeType: (data: unknown) =>
    api.post<ApiResponse<CakeType>>("/catalogue", data),

  updateCakeType: (id: string, data: unknown) =>
    api.patch<ApiResponse<CakeType>>(`/catalogue/${id}`, data),

  deleteCakeType: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/catalogue/${id}`),

  // Pricing requests
  pricingRequests: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<{ id: string; bakery_id: string; cake_type_id: string; size: string; current_price_try: number; requested_price_try: number; status: string; justification: string | null; created_at: string }>>("/admin/pricing-requests", { params }),

  approvePricingRequest: (id: string) =>
    api.patch<ApiResponse<{ message: string }>>(`/admin/pricing-requests/${id}/approve`),

  rejectPricingRequest: (id: string, note: string) =>
    api.patch<ApiResponse<{ message: string }>>(`/admin/pricing-requests/${id}/reject`, { note }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string }>>("/auth/login", { email, password }),
};

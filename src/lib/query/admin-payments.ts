import { PaymentMethod, PaymentStatus } from "@prisma/client";

import api from "@/lib/axios";

// Type definitions
export interface AdminPaymentParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AdminPaymentData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  providerPaymentId?: string;
  checkoutId?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
  order: {
    id: string;
    status: string;
    total: number;
    currency: string;
    customerName?: string;
    customerEmail?: string;
    phone?: string;
    items: any[];
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  };
}

export interface AdminPaymentResponse {
  payments: AdminPaymentData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaymentAnalytics {
  totalPayments: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  successRate: number;
  paymentsByMethod: Record<PaymentMethod, number>;
  paymentsByStatus: Record<PaymentStatus, number>;
  revenueByMethod: Record<PaymentMethod, number>;
  averagePaymentAmount: number;
}

export interface PaymentMethodBreakdown {
  [key: string]: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    revenue: number;
  };
}

export interface RevenueStats {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
  totalTransactions: number;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  deliveryAddress?: string;
  deliveryNotes?: string;
  failureReason?: string;
  metadata?: any;
}

// Query functions
export const fetchAdminPayments = async (
  params: AdminPaymentParams
): Promise<AdminPaymentResponse> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.search) searchParams.set("search", params.search);
    if (params.method) searchParams.set("method", params.method);
    if (params.status) searchParams.set("status", params.status);
    if (params.dateFrom)
      searchParams.set("dateFrom", params.dateFrom.toISOString());
    if (params.dateTo) searchParams.set("dateTo", params.dateTo.toISOString());

    const res = await api.get(`/admin/payments?${searchParams.toString()}`);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch admin payments" };
  }
};

export const fetchPaymentById = async (
  id: string
): Promise<AdminPaymentData> => {
  try {
    const res = await api.get(`/admin/payments/${id}`);
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch payment details" };
  }
};

export const updatePaymentStatus = async (
  id: string,
  data: UpdatePaymentData
): Promise<AdminPaymentData> => {
  try {
    const res = await api.put(`/admin/payments/${id}`, {
      action: "updateStatus",
      ...data,
    });
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to update payment status" };
  }
};

export const confirmCashPayment = async (
  id: string,
  notes?: string
): Promise<AdminPaymentData> => {
  try {
    const res = await api.put(`/admin/payments/${id}`, {
      action: "confirmCash",
      notes,
    });
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to confirm cash payment" };
  }
};

export const processRefund = async (
  id: string,
  amount: number,
  reason?: string
): Promise<AdminPaymentData> => {
  try {
    const res = await api.put(`/admin/payments/${id}`, {
      action: "processRefund",
      amount,
      reason,
    });
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to process refund" };
  }
};

export const bulkConfirmCashPayments = async (
  paymentIds: string[],
  notes?: string
): Promise<{ success: boolean; updated: number }> => {
  try {
    const res = await api.post("/admin/payments", {
      action: "confirmCash",
      paymentIds,
      data: { notes },
    });
    return res.data;
  } catch (err: any) {
    throw (
      err?.response?.data || { error: "Failed to bulk confirm cash payments" }
    );
  }
};

export const bulkUpdatePaymentStatus = async (
  paymentIds: string[],
  status: PaymentStatus
): Promise<{ success: boolean; updated: number }> => {
  try {
    const res = await api.post("/admin/payments", {
      action: "updateStatus",
      paymentIds,
      data: { status },
    });
    return res.data;
  } catch (err: any) {
    throw (
      err?.response?.data || { error: "Failed to bulk update payment status" }
    );
  }
};

export const fetchPaymentAnalytics = async (dateRange?: {
  from: Date;
  to: Date;
}): Promise<{
  analytics: PaymentAnalytics;
  methodBreakdown: PaymentMethodBreakdown;
  revenueStats: RevenueStats;
}> => {
  try {
    const searchParams = new URLSearchParams();

    if (dateRange?.from)
      searchParams.set("dateFrom", dateRange.from.toISOString());
    if (dateRange?.to) searchParams.set("dateTo", dateRange.to.toISOString());

    const res = await api.get(
      `/admin/payments/analytics?${searchParams.toString()}`
    );
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch payment analytics" };
  }
};

// Query keys for TanStack Query
export const adminPaymentKeys = {
  all: ["admin-payments"] as const,
  lists: () => [...adminPaymentKeys.all, "list"] as const,
  list: (params: AdminPaymentParams) =>
    [...adminPaymentKeys.lists(), params] as const,
  details: () => [...adminPaymentKeys.all, "detail"] as const,
  detail: (id: string) => [...adminPaymentKeys.details(), id] as const,
  analytics: () => [...adminPaymentKeys.all, "analytics"] as const,
  analyticsWithRange: (dateRange?: { from: Date; to: Date }) =>
    [...adminPaymentKeys.analytics(), dateRange] as const,
};

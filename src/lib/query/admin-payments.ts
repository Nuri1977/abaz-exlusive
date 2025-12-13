import type {
  AdminPaymentParams,
  AdminPaymentResponse,
  AdminPaymentTableData,
  PaymentActionData,
} from "@/types/admin-payments";
import api from "@/lib/axios";

interface PaymentAnalyticsResponse {
  analytics: {
    totalPayments: number;
    totalRevenue: number;
    totalRefunded: number;
    netRevenue: number;
    successRate: number;
    paymentsByMethod: Record<string, number>;
    paymentsByStatus: Record<string, number>;
    revenueByMethod: Record<string, number>;
    averagePaymentAmount: number;
  };
  methodBreakdown: Record<
    string,
    {
      total: number;
      successful: number;
      failed: number;
      pending: number;
      revenue: number;
    }
  >;
  revenueStats: {
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    growthRate: number;
    totalTransactions: number;
  };
}

// Fetch admin payments with filtering and pagination
export const fetchAdminPayments = async (
  params: AdminPaymentParams
): Promise<AdminPaymentResponse> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
    if (params.search) searchParams.append("search", params.search);
    if (params.method) searchParams.append("method", params.method);
    if (params.status) searchParams.append("status", params.status);
    if (params.dateFrom)
      searchParams.append("dateFrom", params.dateFrom.toISOString());
    if (params.dateTo)
      searchParams.append("dateTo", params.dateTo.toISOString());

    const data = await api.get<AdminPaymentResponse>(
      `/admin/payments?${searchParams.toString()}`
    );

    // Ensure we always return a valid response structure
    if (!data) {
      return {
        payments: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to fetch admin payments"
    );
  }
};

// Fetch single payment by ID
export const fetchPaymentById = async (
  id: string
): Promise<AdminPaymentTableData> => {
  try {
    const data = await api.get<{ payment: AdminPaymentTableData }>(
      `/admin/payments/${id}`
    );
    return data.payment;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to fetch payment details"
    );
  }
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  data: PaymentActionData
): Promise<AdminPaymentTableData> => {
  try {
    const response = await api.put<{ payment: AdminPaymentTableData }>(
      `/admin/payments/${id}`,
      data
    );
    return response.payment;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to update payment status"
    );
  }
};

// Confirm cash payment
export const confirmCashPayment = async (
  id: string,
  notes?: string
): Promise<AdminPaymentTableData> => {
  try {
    const data = await api.put<{ payment: AdminPaymentTableData }>(
      `/admin/payments/${id}`,
      {
        action: "confirmCash",
        notes,
      }
    );
    return data.payment;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to confirm cash payment"
    );
  }
};

// Process refund
export const processRefund = async (
  id: string,
  amount: number,
  reason?: string
): Promise<AdminPaymentTableData> => {
  try {
    const data = await api.put<{ payment: AdminPaymentTableData }>(
      `/admin/payments/${id}`,
      {
        action: "processRefund",
        amount,
        reason,
      }
    );
    return data.payment;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(error?.response?.data?.error || "Failed to process refund");
  }
};

// Fetch payment analytics
export const fetchPaymentAnalytics = async (dateRange?: {
  from: Date;
  to: Date;
}): Promise<PaymentAnalyticsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (dateRange?.from)
      searchParams.append("dateFrom", dateRange.from.toISOString());
    if (dateRange?.to)
      searchParams.append("dateTo", dateRange.to.toISOString());

    const data = await api.get<PaymentAnalyticsResponse>(
      `/admin/payments/analytics?${searchParams.toString()}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to fetch payment analytics"
    );
  }
};

// Sync payment status with Polar
export const syncPaymentWithPolar = async (id: string, forceSync = false) => {
  try {
    const data = await api.post<{
      message: string;
      previousStatus?: string;
      newStatus?: string;
      polarStatus?: string;
      synced: boolean;
      forceSync?: boolean;
      payment?: AdminPaymentTableData;
    }>(`/admin/payments/${id}/sync`, { forceSync });
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to sync payment with Polar"
    );
  }
};

import type {
  UserPaymentParams,
  UserPaymentResponse,
  UserPaymentTableData,
} from "@/types/user-payments";
import api from "@/lib/axios";

// Fetch user payments with filtering and pagination
export const fetchUserPayments = async (
  params: UserPaymentParams = {}
): Promise<UserPaymentResponse> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
    if (params.method) searchParams.append("method", params.method);
    if (params.status) searchParams.append("status", params.status);

    const data = await api.get(`/user/payments?${searchParams.toString()}`);

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

    return data as UserPaymentResponse;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to fetch user payments"
    );
  }
};

// Fetch individual user payment by ID
export const fetchUserPaymentById = async (
  id: string
): Promise<UserPaymentTableData> => {
  try {
    const data = await api.get(`/user/payments/${id}`);
    return (data as { data: UserPaymentTableData }).data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to fetch payment details"
    );
  }
};

// Update user payment (limited fields)
export const updateUserPayment = async (
  id: string,
  updateData: {
    deliveryAddress?: string;
    deliveryNotes?: string;
  }
): Promise<UserPaymentTableData> => {
  try {
    const data = await api.put(`/user/payments/${id}`, updateData);
    return (data as { data: UserPaymentTableData }).data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(error?.response?.data?.error || "Failed to update payment");
  }
};

// Request refund for eligible payment
export const requestRefund = async (
  id: string,
  reason: string
): Promise<void> => {
  try {
    await api.post(`/user/payments/${id}/refund`, { reason });
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(error?.response?.data?.error || "Failed to request refund");
  }
};

// Download receipt data
export const downloadReceipt = async (id: string): Promise<unknown> => {
  try {
    const data = await api.get(`/user/payments/${id}/receipt`);
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } } };
    throw new Error(
      error?.response?.data?.error || "Failed to download receipt"
    );
  }
};
